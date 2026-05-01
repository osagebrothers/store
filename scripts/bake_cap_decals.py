"""Bake cap decals via DIRECT UV painting (no 3D projection).

Each decal is mapped onto a specific UV region of each outer panel.
Per-panel UV bounds for the front/back/left/right zones are derived from
the empirical inspect samples:

  outer_left  U=[0.143, 0.458], V=[0.441, 0.883]
  outer_right U=[0.469, 0.774], V=[0.446, 0.890]

  Per the corrected interpretation (mesh +y → world +z = front-facing):
    HIGH V (≈0.88) = cap-FRONT face
    LOW  V (≈0.44) = cap-BACK face
    MID  V (≈0.73) = cap-APEX
    LOW-MID V (≈0.55) = cap-side / brim-outer area

The cap-center seam (x=0) is at outer_left U≈0.43 (HIGH U) and
outer_right U≈0.48 (LOW U). The cap-outer side is at outer_left U≈0.18 (LOW)
and outer_right U≈0.74 (HIGH).

Each decal is split into a left half (paints onto outer_left) and a right
half (paints onto outer_right) so the two halves meet at the cap-center seam.
"""
import bpy, time
from mathutils import Vector

GLB = '/Users/z/work/osage/store/public/models/baseball_cap.glb'
OUT = '/Users/z/work/osage/store/public/images/cap_decals_atlas.png'
PUB = '/Users/z/work/osage/store/public/images'
TEX = 2048

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
mainCap = next(o for o in bpy.data.objects
               if o.type == 'MESH' and o.parent and o.parent.name == 'mainCap')
me = mainCap.data
me.calc_loop_triangles()
print(f'UV layers: {[(i, l.name, l.active) for i, l in enumerate(me.uv_layers)]}')
# three.js samples mat.map via the FIRST UV layer (UVMap, index 0). Lock to it.
target_uv = me.uv_layers[0]
me.uv_layers.active = target_uv
uvl = target_uv.data
print(f'Baking against UV layer: {target_uv.name}')

# Identify outer panels via UV-island clustering
poly_meta = []
for poly in me.polygons:
    uv_pts = [uvl[li].uv.copy() for li in poly.loop_indices]
    poly_meta.append({
        'uv_min': (min(p.x for p in uv_pts), min(p.y for p in uv_pts)),
        'uv_max': (max(p.x for p in uv_pts), max(p.y for p in uv_pts)),
    })
GRID = 0.005
cells = {}
for i, p in enumerate(poly_meta):
    cx = int((p['uv_min'][0] + p['uv_max'][0]) / 2 / GRID)
    cy = int((p['uv_min'][1] + p['uv_max'][1]) / 2 / GRID)
    cells.setdefault((cx, cy), []).append(i)
parent = list(range(len(poly_meta)))
def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]; a = parent[a]
    return a
def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb: parent[ra] = rb
for (cx, cy), pids in cells.items():
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx == 0 and dy == 0: continue
            nbr = cells.get((cx+dx, cy+dy))
            if nbr:
                for a in pids:
                    for b in nbr:
                        union(a, b)
    if len(pids) > 1:
        for j in range(1, len(pids)):
            union(pids[0], pids[j])
poly_island = [find(i) for i in range(len(poly_meta))]
island_size = {}
island_v_min = {}
island_v_max = {}
island_x_avg = {}
island_x_count = {}
for i, p in enumerate(poly_meta):
    iid = poly_island[i]
    island_size[iid] = island_size.get(iid, 0) + 1
    island_v_min[iid] = min(island_v_min.get(iid, 1.0), p['uv_min'][1])
    island_v_max[iid] = max(island_v_max.get(iid, 0.0), p['uv_max'][1])
big = sorted(island_size.items(), key=lambda kv: kv[1], reverse=True)
outer_iids = []
inner_iids = []
for iid, _ in big:
    if island_v_min[iid] > 0.4 and island_v_max[iid] > 0.7:
        if len(outer_iids) < 2: outer_iids.append(iid)
    elif island_v_max[iid] < 0.5:
        if len(inner_iids) < 2: inner_iids.append(iid)
    if len(outer_iids) >= 2 and len(inner_iids) >= 2: break

# Determine which is left vs right by looking at 3D x-centroid
def island_x_centroid(iid):
    polys = [i for i, p in enumerate(poly_meta) if poly_island[i] == iid]
    cx = 0; n = 0
    for pi in polys:
        poly = me.polygons[pi]
        for vi in poly.vertices:
            cx += me.vertices[vi].co.x
            n += 1
    return cx / n if n else 0.0
iid_left = min(outer_iids, key=island_x_centroid)
iid_right = max(outer_iids, key=island_x_centroid)
print(f'outer_left island_id={iid_left}, outer_right island_id={iid_right}')

# Compute exact UV bbox for each outer panel
def panel_bbox(iid):
    us, vs = [], []
    for i, p in enumerate(poly_meta):
        if poly_island[i] == iid:
            us.append(p['uv_min'][0]); us.append(p['uv_max'][0])
            vs.append(p['uv_min'][1]); vs.append(p['uv_max'][1])
    return (min(us), min(vs), max(us), max(vs))

bbox_L = panel_bbox(iid_left)
bbox_R = panel_bbox(iid_right)
print(f'outer_left  UV bbox: U=[{bbox_L[0]:.4f}, {bbox_L[2]:.4f}] V=[{bbox_L[1]:.4f}, {bbox_L[3]:.4f}]')
print(f'outer_right UV bbox: U=[{bbox_R[0]:.4f}, {bbox_R[2]:.4f}] V=[{bbox_R[1]:.4f}, {bbox_R[3]:.4f}]')

# Each panel's tris with UVs and 3D positions + surface normal
all_relevant_iids = set(outer_iids) | set(inner_iids)
tris_by_iid = {iid: [] for iid in all_relevant_iids}
for t in me.loop_triangles:
    iid = poly_island[t.polygon_index]
    if iid in tris_by_iid:
        uvs = [uvl[li].uv.copy() for li in t.loops]
        p3 = [me.vertices[vi].co.copy() for vi in t.vertices]
        e1 = p3[1] - p3[0]
        e2 = p3[2] - p3[0]
        n = e1.cross(e2)
        nl = n.length
        n = n / nl if nl > 1e-9 else Vector((0,0,0))
        cy_ = (p3[0].y + p3[1].y + p3[2].y) / 3
        cz_ = (p3[0].z + p3[1].z + p3[2].z) / 3
        cx_ = (p3[0].x + p3[1].x + p3[2].x) / 3
        tris_by_iid[iid].append({
            'uvs': uvs,
            'cx': cx_, 'cy': cy_, 'cz': cz_,
            'normal': n,
        })
print(f'tris: outer_left={len(tris_by_iid[iid_left])}, outer_right={len(tris_by_iid[iid_right])}')

# Inner panels for the inside label
iid_inner_left = None
iid_inner_right = None
if len(inner_iids) >= 2:
    iid_inner_left = min(inner_iids, key=island_x_centroid)
    iid_inner_right = max(inner_iids, key=island_x_centroid)
    print(f'inner_left={iid_inner_left}, inner_right={iid_inner_right}')

bbox_inner_L = panel_bbox(iid_inner_left) if iid_inner_left else None
bbox_inner_R = panel_bbox(iid_inner_right) if iid_inner_right else None

# Compute UV bbox of front-facing tris on each panel
def uv_bbox_for_zone(tris, predicate):
    """Generic: UV bbox of tris whose centroid + normal satisfies predicate."""
    us, vs = [], []
    for t in tris:
        if not predicate(t): continue
        for uv in t['uvs']:
            us.append(uv.x); vs.append(uv.y)
    if not us: return None
    return (min(us), min(vs), max(us), max(vs))

def front_face_uv_bbox(tris):
    return uv_bbox_for_zone(tris, lambda t:
        t['cy'] > 3.0 and 0.5 <= t['cz'] <= 3.0 and abs(t['normal'].y) > 0.5)

def side_face_uv_bbox(tris, sign_x):
    """sign_x = -1 for cap-LEFT side panel, +1 for cap-RIGHT."""
    return uv_bbox_for_zone(tris, lambda t:
        sign_x * t['cx'] > 3.0
        and abs(t['cy']) < 1.5
        and 0.8 <= t['cz'] <= 3.5
        and abs(t['normal'].x) > 0.5)

def back_face_uv_bbox(tris):
    return uv_bbox_for_zone(tris, lambda t:
        t['cy'] < -3.0 and 0.5 <= t['cz'] <= 3.5 and abs(t['normal'].y) > 0.5)

front_uv_L = front_face_uv_bbox(tris_by_iid[iid_left])
front_uv_R = front_face_uv_bbox(tris_by_iid[iid_right])
side_uv_L = side_face_uv_bbox(tris_by_iid[iid_left], -1)
side_uv_R = side_face_uv_bbox(tris_by_iid[iid_right], +1)
back_uv_L = back_face_uv_bbox(tris_by_iid[iid_left])
back_uv_R = back_face_uv_bbox(tris_by_iid[iid_right])
print(f'front L: {front_uv_L}')
print(f'front R: {front_uv_R}')
print(f'side  L: {side_uv_L}')
print(f'side  R: {side_uv_R}')
print(f'back  L: {back_uv_L}')
print(f'back  R: {back_uv_R}')

def load_decal(path):
    img = bpy.data.images.load(path, check_existing=False)
    img.colorspace_settings.name = 'sRGB'
    return {'pixels': list(img.pixels), 'w': img.size[0], 'h': img.size[1]}

dimg = {
    'mega':     load_decal(f'{PUB}/mega_front_text.png'),
    'eagle':    load_decal(f'{PUB}/eagle_decal.png'),
    'feathers': load_decal(f'{PUB}/feathers_decal.png'),
    'panda':    load_decal(f'{PUB}/panda_decal.png'),
    'inside':   load_decal(f'{PUB}/inside_label.png'),
}

def sample(img, sx, sy):
    if sx < 0.0 or sx >= 1.0 or sy < 0.0 or sy >= 1.0: return None
    px = min(img['w']-1, int(sx * img['w']))
    py = min(img['h']-1, int(sy * img['h']))
    idx = (py * img['w'] + px) * 4
    p = img['pixels']
    return (p[idx], p[idx+1], p[idx+2], p[idx+3])

atlas = [0.0] * (TEX * TEX * 4)

def edge(ax, ay, bx, by, cx, cy):
    return (bx-ax)*(cy-ay) - (by-ay)*(cx-ax)

def paint_decal_on_panel(tris_list, panel_bbox,
                         u_lo_frac, u_hi_frac, v_lo_frac, v_hi_frac,
                         decal_img, ds_lo, ds_hi, dt_lo, dt_hi,
                         flip_v=False):
    """Paint a decal slice into a UV sub-rectangle of a panel."""
    u_min, v_min, u_max, v_max = panel_bbox
    bw, bh = u_max - u_min, v_max - v_min
    target_u_lo = u_min + u_lo_frac * bw
    target_u_hi = u_min + u_hi_frac * bw
    target_v_lo = v_min + v_lo_frac * bh
    target_v_hi = v_min + v_hi_frac * bh

    hits = 0
    for t in tris_list:
        uvs = t['uvs'] if isinstance(t, dict) else t
        # rasterize in atlas pixel space, but only where pixel UV is in target
        px0, py0 = uvs[0].x*TEX, uvs[0].y*TEX
        px1, py1 = uvs[1].x*TEX, uvs[1].y*TEX
        px2, py2 = uvs[2].x*TEX, uvs[2].y*TEX
        pxmin = max(0, int(min(px0, px1, px2)))
        pxmax = min(TEX-1, int(max(px0, px1, px2)) + 1)
        pymin = max(0, int(min(py0, py1, py2)))
        pymax = min(TEX-1, int(max(py0, py1, py2)) + 1)
        # quick reject: tri's UV bbox doesn't overlap target
        u0 = min(px0, px1, px2) / TEX
        u1 = max(px0, px1, px2) / TEX
        v0 = min(py0, py1, py2) / TEX
        v1 = max(py0, py1, py2) / TEX
        if u1 < target_u_lo or u0 > target_u_hi or v1 < target_v_lo or v0 > target_v_hi:
            continue
        area = edge(px0, py0, px1, py1, px2, py2)
        if abs(area) < 1e-9: continue
        inv_area = 1.0 / area
        for py in range(pymin, pymax + 1):
            v_atlas = (py + 0.5) / TEX
            if v_atlas < target_v_lo or v_atlas >= target_v_hi: continue
            for px in range(pxmin, pxmax + 1):
                u_atlas = (px + 0.5) / TEX
                if u_atlas < target_u_lo or u_atlas >= target_u_hi: continue
                w0 = edge(px1, py1, px2, py2, px+0.5, py+0.5) * inv_area
                w1 = edge(px2, py2, px0, py0, px+0.5, py+0.5) * inv_area
                w2 = edge(px0, py0, px1, py1, px+0.5, py+0.5) * inv_area
                if w0 < 0 or w1 < 0 or w2 < 0: continue
                # Decal sample fractions within target rect
                fu = (u_atlas - target_u_lo) / (target_u_hi - target_u_lo)
                fv = (v_atlas - target_v_lo) / (target_v_hi - target_v_lo)
                sx = ds_lo + fu * (ds_hi - ds_lo)
                sy = dt_lo + fv * (dt_hi - dt_lo)
                if flip_v: sy = dt_lo + dt_hi - sy
                rgba = sample(decal_img, sx, sy)
                if rgba is None or rgba[3] < 0.02: continue
                i = (py * TEX + px) * 4
                a = rgba[3]
                inv = 1.0 - a
                atlas[i]   = rgba[0] * a + atlas[i]   * inv
                atlas[i+1] = rgba[1] * a + atlas[i+1] * inv
                atlas[i+2] = rgba[2] * a + atlas[i+2] * inv
                atlas[i+3] = a + atlas[i+3] * inv
                hits += 1
    return hits

# ============================================================
# UV mapping per panel (verified by inspect-cap.py):
# - HIGH V (~0.88) = cap-FRONT face
# - LOW V (~0.44) = cap-BACK face (where strap is)
# - MID-LOW V (~0.55) = cap-side/brim-outer area
# - HIGH U on outer_left = cap-CENTER seam (low x = cap-outer)
# - LOW U on outer_right = cap-CENTER seam (high x = cap-outer)
# ============================================================
t0 = time.time()
hit_log = {}

# MEGA on cap-FRONT — paint into the EXACT UV bbox of the front-facing tris.
# The front-face UV bbox is computed from tris with normal.y > 0.4 in the
# y > 3.0 z [0.5, 2.8] zone — these are truly front-facing surfaces.
def paint_in_uv_bbox(uv_bbox, decal_img, ds_lo, ds_hi, dt_lo, dt_hi,
                     tris_list, flip_v=False, flip_u=False):
    if not uv_bbox: return 0
    u_lo, v_lo, u_hi, v_hi = uv_bbox
    hits = 0
    for t in tris_list:
        uvs = t['uvs'] if isinstance(t, dict) else t
        px0, py0 = uvs[0].x*TEX, uvs[0].y*TEX
        px1, py1 = uvs[1].x*TEX, uvs[1].y*TEX
        px2, py2 = uvs[2].x*TEX, uvs[2].y*TEX
        u0_t = min(uvs[0].x, uvs[1].x, uvs[2].x)
        u1_t = max(uvs[0].x, uvs[1].x, uvs[2].x)
        v0_t = min(uvs[0].y, uvs[1].y, uvs[2].y)
        v1_t = max(uvs[0].y, uvs[1].y, uvs[2].y)
        if u1_t < u_lo or u0_t > u_hi or v1_t < v_lo or v0_t > v_hi: continue
        pxmin = max(0, int(min(px0, px1, px2)))
        pxmax = min(TEX-1, int(max(px0, px1, px2)) + 1)
        pymin = max(0, int(min(py0, py1, py2)))
        pymax = min(TEX-1, int(max(py0, py1, py2)) + 1)
        area = edge(px0, py0, px1, py1, px2, py2)
        if abs(area) < 1e-9: continue
        inv_area = 1.0 / area
        for py in range(pymin, pymax + 1):
            v_atlas = (py + 0.5) / TEX
            if v_atlas < v_lo or v_atlas >= v_hi: continue
            for px in range(pxmin, pxmax + 1):
                u_atlas = (px + 0.5) / TEX
                if u_atlas < u_lo or u_atlas >= u_hi: continue
                w0 = edge(px1, py1, px2, py2, px+0.5, py+0.5) * inv_area
                w1 = edge(px2, py2, px0, py0, px+0.5, py+0.5) * inv_area
                w2 = edge(px0, py0, px1, py1, px+0.5, py+0.5) * inv_area
                if w0 < 0 or w1 < 0 or w2 < 0: continue
                fu = (u_atlas - u_lo) / (u_hi - u_lo)
                fv = (v_atlas - v_lo) / (v_hi - v_lo)
                sx = ds_lo + fu * (ds_hi - ds_lo)
                sy = dt_lo + fv * (dt_hi - dt_lo)
                if flip_u: sx = ds_lo + ds_hi - sx
                if flip_v: sy = dt_lo + dt_hi - sy
                rgba = sample(decal_img, sx, sy)
                if rgba is None or rgba[3] < 0.02: continue
                i = (py * TEX + px) * 4
                a = rgba[3]
                inv = 1.0 - a
                atlas[i]   = rgba[0] * a + atlas[i]   * inv
                atlas[i+1] = rgba[1] * a + atlas[i+1] * inv
                atlas[i+2] = rgba[2] * a + atlas[i+2] * inv
                atlas[i+3] = a + atlas[i+3] * inv
                hits += 1
    return hits

# MEGA on FRONT — paint into the EXACT front-face UV bbox of each panel.
# Center the text within the available area (inset 10% on each side so it
# sits cleanly within the front face, no clipping).
def inset_bbox(b, frac):
    if not b: return None
    u_lo, v_lo, u_hi, v_hi = b
    bw, bh = u_hi - u_lo, v_hi - v_lo
    return (u_lo + frac * bw, v_lo + frac * bh,
            u_hi - frac * bw, v_hi - frac * bh)

mega_L_bbox = inset_bbox(front_uv_L, 0.05)
mega_R_bbox = inset_bbox(front_uv_R, 0.05)
hit_log['mega_L'] = paint_in_uv_bbox(
    mega_L_bbox, dimg['mega'], 0.0, 0.5, 0.0, 1.0,
    tris_by_iid[iid_left], flip_v=True)
hit_log['mega_R'] = paint_in_uv_bbox(
    mega_R_bbox, dimg['mega'], 0.5, 1.0, 0.0, 1.0,
    tris_by_iid[iid_right], flip_v=True)

def center_in_bbox(b, frac_w, frac_h):
    """Return a sub-bbox centered in b with given width/height fractions."""
    if not b: return None
    u_lo, v_lo, u_hi, v_hi = b
    bw, bh = u_hi - u_lo, v_hi - v_lo
    cu, cv = (u_lo + u_hi) / 2, (v_lo + v_hi) / 2
    hw = bw * frac_w / 2
    hh = bh * frac_h / 2
    return (cu - hw, cv - hh, cu + hw, cv + hh)

def anchor_in_bbox(b, frac_w, frac_h, anchor_u=0.5, anchor_v=0.5):
    """Sub-bbox of size (frac_w, frac_h) anchored at (anchor_u, anchor_v) in b.
    anchor_u/v in [0,1]: 0=lo, 1=hi edge of b. Width/height clipped to bbox."""
    if not b: return None
    u_lo, v_lo, u_hi, v_hi = b
    bw, bh = u_hi - u_lo, v_hi - v_lo
    cw, ch = bw * frac_w, bh * frac_h
    cu = u_lo + anchor_u * bw
    cv = v_lo + anchor_v * bh
    u0 = max(u_lo, cu - cw/2); u1 = min(u_hi, cu + cw/2)
    v0 = max(v_lo, cv - ch/2); v1 = min(v_hi, cv + ch/2)
    return (u0, v0, u1, v1)

# Eagle on cap-LEFT back panel, panda on cap-RIGHT back panel.
# Hardcoded UV bboxes verified by 3D-position diagnostic to land on
# the truly back-facing surface (y<-2.5) at mid-Z (1.5<z<3.5):
#   outer-LEFT  V=[0.50,0.55] → 3D X[-3.91,0] Y[-4.33,-2.62] Z[0.07,2.69]
#   outer-LEFT  V=[0.55,0.58] → 3D X[-3.54,0] Y[-3.77,-2.51] Z[1.62,3.99]
# Mirror for cap-RIGHT outer panel via U reflection.
# To go LOW on the cap (above strap), use lower V (closer to 0.50).
# To go HIGH (toward apex), use higher V (toward 0.58).
# User wants eagle+panda DOWN → keep V near low-mid back range.
# Eagle on back-LEFT corner, panda on back-RIGHT corner.
# v4 test confirmed V=[0.515, 0.575] U=[0.205, 0.305] renders mid-center-back.
# Shift U outward (toward LOW U on outer-left, HIGH U on outer-right) for corners.
# Lower V slightly for "down on back" placement.
eagle_bbox = (0.165, 0.500, 0.265, 0.560)
panda_bbox = (0.685, 0.500, 0.785, 0.560)
hit_log['eagle'] = paint_in_uv_bbox(
    eagle_bbox, dimg['eagle'], 0.0, 1.0, 0.0, 1.0,
    tris_by_iid[iid_left], flip_v=True) if eagle_bbox else 0
hit_log['panda'] = paint_in_uv_bbox(
    panda_bbox, dimg['panda'], 0.0, 1.0, 0.0, 1.0,
    tris_by_iid[iid_right], flip_v=True) if panda_bbox else 0

# FEATHERS centered above the back-hat-hole, split across the cap-center seam.
# Lower V than apex, but above the strap/hole. Anchor at the seam (u=1.0 on L, u=0.0 on R).
# Feathers split centered, slightly above hat-hole / strap level.
feathers_L_bbox = (0.380, 0.470, 0.450, 0.530)
feathers_R_bbox = (0.470, 0.470, 0.540, 0.530)
hit_log['feathers_L'] = paint_in_uv_bbox(
    feathers_L_bbox, dimg['feathers'], 0.5, 1.0, 0.0, 1.0,
    tris_by_iid[iid_left], flip_v=True) if feathers_L_bbox else 0
hit_log['feathers_R'] = paint_in_uv_bbox(
    feathers_R_bbox, dimg['feathers'], 0.0, 0.5, 0.0, 1.0,
    tris_by_iid[iid_right], flip_v=True) if feathers_R_bbox else 0

# INSIDE LABEL ("Out, Out, ...") on inner panels at back-center.
# Inner panel V range [0.008, 0.487]; paint near top (back of cap interior)
# split at the cap-center seam.
if bbox_inner_L and bbox_inner_R:
    hit_log['inside_L'] = paint_decal_on_panel(
        tris_by_iid[iid_inner_left], bbox_inner_L,
        u_lo_frac=0.50, u_hi_frac=0.95, v_lo_frac=0.55, v_hi_frac=0.95,
        decal_img=dimg['inside'], ds_lo=0.0, ds_hi=0.5, dt_lo=0.0, dt_hi=1.0,
        flip_v=False)
    hit_log['inside_R'] = paint_decal_on_panel(
        tris_by_iid[iid_inner_right], bbox_inner_R,
        u_lo_frac=0.05, u_hi_frac=0.50, v_lo_frac=0.55, v_hi_frac=0.95,
        decal_img=dimg['inside'], ds_lo=0.5, ds_hi=1.0, dt_lo=0.0, dt_hi=1.0,
        flip_v=False)

print(f'\nbake done in {time.time()-t0:.1f}s')
for k, v in hit_log.items():
    print(f'  {k}: {v}')

img = bpy.data.images.new('cap_decals_atlas', width=TEX, height=TEX, alpha=True)
img.pixels = atlas
img.filepath_raw = OUT
img.file_format = 'PNG'
img.save()
print(f'Saved {OUT}')
