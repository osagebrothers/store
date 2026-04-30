"""Bake decals — 3D-projection rasterizer (v3, correct mapping).

Per-triangle UV rasterization with barycentric 3D position interpolation.
For each pixel, project 3D position orthographically onto each decal's tangent
plane and sample the decal image. First decal whose AABB matches wins.

Cap-local axes (verified):
  -y = forward (brim), +y = back (strap), +z = up (apex)
  bbox: x=±4.74, y=[-4.82, +4.54], z=[+0.04, +5.84]

Atlas mapping (verified by inspect-cap.py):
  outer_left:  U=[0.143, 0.458], V=[0.441, 0.883]
    front face → V≈0.44, back face → V≈0.88, apex → V≈0.73
    cap-center seam → U≈0.43, cap-outer → U≈0.18
  outer_right: U=[0.469, 0.774], V=[0.446, 0.890]

Inner shells exist at V=[0.008, 0.487] — must be filtered out by island.

Three.js flipY=true: atlas Blender-storage py == glTF V * H, direct.
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
uvl = me.uv_layers.active.data

# --- UV-island clustering at the polygon level ---
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
# Find the two big outer-panel islands by size + V range.
island_size = {}
island_v_min = {}
island_v_max = {}
for i, p in enumerate(poly_meta):
    iid = poly_island[i]
    island_size[iid] = island_size.get(iid, 0) + 1
    island_v_min[iid] = min(island_v_min.get(iid, 1.0), p['uv_min'][1])
    island_v_max[iid] = max(island_v_max.get(iid, 0.0), p['uv_max'][1])
big = sorted(island_size.items(), key=lambda kv: kv[1], reverse=True)
outer_islands = set()
for iid, _ in big:
    if island_v_min[iid] > 0.4 and island_v_max[iid] > 0.7:
        outer_islands.add(iid)
    if len(outer_islands) >= 2: break
print(f'islands: {len(island_size)} | big-6: {[(iid, island_size[iid], round(island_v_min[iid],3), round(island_v_max[iid],3)) for iid, _ in big]}')
print(f'outer panels selected: {len(outer_islands)}')

tris = []
for t in me.loop_triangles:
    if poly_island[t.polygon_index] not in outer_islands:
        continue
    uvs = [uvl[li].uv.copy() for li in t.loops]
    p3 = [me.vertices[vi].co.copy() for vi in t.vertices]
    cx_ = (p3[0].x + p3[1].x + p3[2].x) / 3
    cy_ = (p3[0].y + p3[1].y + p3[2].y) / 3
    cz_ = (p3[0].z + p3[1].z + p3[2].z) / 3
    tris.append({'uvs': uvs, 'p3': p3, 'cx': cx_, 'cy': cy_, 'cz': cz_})
print(f'outer-panel tris: {len(tris)}')

def load_decal(path):
    img = bpy.data.images.load(path, check_existing=False)
    img.colorspace_settings.name = 'sRGB'
    return {'pixels': list(img.pixels), 'w': img.size[0], 'h': img.size[1]}

dimg = {
    'mega':     load_decal(f'{PUB}/mega_front_text.png'),
    'eagle':    load_decal(f'{PUB}/eagle_decal.png'),
    'feathers': load_decal(f'{PUB}/feathers_decal.png'),
    'panda':    load_decal(f'{PUB}/panda_decal.png'),
}

def sample(img, sx, sy):
    if sx < 0.0 or sx >= 1.0 or sy < 0.0 or sy >= 1.0:
        return None
    px = int(sx * img['w'])
    py = int(sy * img['h'])
    if px >= img['w']: px = img['w'] - 1
    if py >= img['h']: py = img['h'] - 1
    idx = (py * img['w'] + px) * 4
    p = img['pixels']
    return (p[idx], p[idx+1], p[idx+2], p[idx+3])

# Disjoint zones: any pixel matches at most ONE decal.
#   front face (y < -1.5): MEGA
#   back face (y > +1.5):
#     |x| < 1.0 → feathers (back-center)
#     +1.0 < x → eagle (back-cap-right, viewer-LEFT in back view)
#     x < -1.0 → panda (back-cap-left, viewer-RIGHT in back view)
# MEGA aspect 1024:407 ≈ 2.515.

decals = [
    # FRONT face (mesh +y). MAKE EARTH GREAT AGAIN — bold, fills the front
    # like a Trump MAGA cap. Positioned just above the brim line.
    dict(name='mega', img=dimg['mega'],
         center=Vector((0.0, +3.5, 2.0)),
         du=Vector((+1, 0, 0)), dv=Vector((0, 0, 1)),
         half_w=3.0, half_h=3.0/2.515,
         x_lo=-3.5, x_hi=+3.5, y_lo=+1.5, y_hi=+5.0, z_lo=0.5, z_hi=3.5),
    # CAP-LEFT side panel (mesh -x). Embroidered mascot, well-proportioned.
    dict(name='panda', img=dimg['panda'],
         center=Vector((-3.7, 0.0, 1.8)),
         du=Vector((0, -1, 0)), dv=Vector((0, 0, 1)),
         half_w=1.1, half_h=1.1,
         x_lo=-5.0, x_hi=-1.8, y_lo=-1.4, y_hi=+1.4, z_lo=0.5, z_hi=3.2),
    # CAP-RIGHT side panel (mesh +x). Mirror of panda.
    dict(name='eagle', img=dimg['eagle'],
         center=Vector((+3.7, 0.0, 1.8)),
         du=Vector((0, +1, 0)), dv=Vector((0, 0, 1)),
         half_w=1.1, half_h=1.1,
         x_lo=+1.8, x_hi=+5.0, y_lo=-1.4, y_hi=+1.4, z_lo=0.5, z_hi=3.2),
    # BACK panel center (mesh -y). Crossed feathers — proportional embroidery.
    dict(name='feathers', img=dimg['feathers'],
         center=Vector((0.0, -3.7, 1.8)),
         du=Vector((+1, 0, 0)), dv=Vector((0, 0, 1)),
         half_w=1.4, half_h=1.4,
         x_lo=-1.6, x_hi=+1.6, y_lo=-5.0, y_hi=-1.8, z_lo=0.5, z_hi=3.2),
]

atlas = [0.0] * (TEX * TEX * 4)
hits = {d['name']: 0 for d in decals}

def edge(ax, ay, bx, by, cx, cy):
    return (bx-ax)*(cy-ay) - (by-ay)*(cx-ax)

t0 = time.time()
n_used = 0
for ti, tri in enumerate(tris):
    if ti % 4000 == 0:
        print(f'  tri {ti}/{len(tris)} ({time.time()-t0:.1f}s) used={n_used}')
    cx_, cy_, cz_ = tri['cx'], tri['cy'], tri['cz']
    eligible = []
    for d in decals:
        if d['x_lo']-0.4 <= cx_ <= d['x_hi']+0.4 and \
           d['y_lo']-0.4 <= cy_ <= d['y_hi']+0.4 and \
           d['z_lo']-0.4 <= cz_ <= d['z_hi']+0.4:
            eligible.append(d)
    if not eligible:
        continue
    n_used += 1

    uvs = tri['uvs']; p3 = tri['p3']
    px0, py0 = uvs[0].x*TEX, uvs[0].y*TEX
    px1, py1 = uvs[1].x*TEX, uvs[1].y*TEX
    px2, py2 = uvs[2].x*TEX, uvs[2].y*TEX
    pxmin = max(0, int(min(px0, px1, px2)))
    pxmax = min(TEX-1, int(max(px0, px1, px2)) + 1)
    pymin = max(0, int(min(py0, py1, py2)))
    pymax = min(TEX-1, int(max(py0, py1, py2)) + 1)
    if pxmax < pxmin or pymax < pymin: continue

    area = edge(px0, py0, px1, py1, px2, py2)
    if abs(area) < 1e-9: continue
    inv_area = 1.0 / area
    p0, p1, p2 = p3[0], p3[1], p3[2]

    for py in range(pymin, pymax + 1):
        py_c = py + 0.5
        for px in range(pxmin, pxmax + 1):
            px_c = px + 0.5
            w0 = edge(px1, py1, px2, py2, px_c, py_c) * inv_area
            w1 = edge(px2, py2, px0, py0, px_c, py_c) * inv_area
            w2 = edge(px0, py0, px1, py1, px_c, py_c) * inv_area
            if w0 < 0 or w1 < 0 or w2 < 0: continue
            wx = p0.x*w0 + p1.x*w1 + p2.x*w2
            wy = p0.y*w0 + p1.y*w1 + p2.y*w2
            wz = p0.z*w0 + p1.z*w1 + p2.z*w2

            for d in eligible:
                if not (d['x_lo'] <= wx <= d['x_hi']): continue
                if not (d['y_lo'] <= wy <= d['y_hi']): continue
                if not (d['z_lo'] <= wz <= d['z_hi']): continue
                rx = wx - d['center'].x
                ry = wy - d['center'].y
                rz = wz - d['center'].z
                u_d = (rx*d['du'].x + ry*d['du'].y + rz*d['du'].z) / d['half_w']
                v_d = (rx*d['dv'].x + ry*d['dv'].y + rz*d['dv'].z) / d['half_h']
                if -1.0 <= u_d <= 1.0 and -1.0 <= v_d <= 1.0:
                    sx = (u_d + 1.0) * 0.5
                    sy = (v_d + 1.0) * 0.5
                    rgba = sample(d['img'], sx, sy)
                    if rgba is None or rgba[3] < 0.02: continue
                    i = (py * TEX + px) * 4
                    a = rgba[3]
                    inv = 1.0 - a
                    atlas[i]   = rgba[0] * a + atlas[i]   * inv
                    atlas[i+1] = rgba[1] * a + atlas[i+1] * inv
                    atlas[i+2] = rgba[2] * a + atlas[i+2] * inv
                    atlas[i+3] = a + atlas[i+3] * inv
                    hits[d['name']] += 1
                    break

print(f'\nbake done in {time.time()-t0:.1f}s')
for k, v in hits.items():
    print(f'  {k}: {v}')

img = bpy.data.images.new('cap_decals_atlas', width=TEX, height=TEX, alpha=True)
img.pixels = atlas
img.filepath_raw = OUT
img.file_format = 'PNG'
img.save()
print(f'Saved {OUT}')
