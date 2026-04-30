"""Read decal Empty transforms from cap_decals.blend and emit the
center/du/dv/half_w/half_h values for bake_cap_decals.py.

The Empty's local axes encode the decal frame:
  +X = du (decal-right direction)
  +Z = dv (decal-up direction)
  +Y = du × dv (projection direction; visualization plane normal)
Scale: (half_w, _, half_h)
Location: decal center

Run: /Applications/Blender.app/Contents/MacOS/Blender -b \\
       scripts/cap_decals.blend -P scripts/blender_decal_sync.py
"""
import bpy
from mathutils import Vector

DECAL_NAMES = ['mega', 'panda', 'eagle', 'feathers', 'inside']

print('\n=== Decal transforms (paste into bake_cap_decals.py) ===\n')
for name in DECAL_NAMES:
    obj = bpy.data.objects.get(f'decal_{name}')
    if not obj:
        print(f'  # {name}: NOT FOUND')
        continue
    M = obj.matrix_world
    center = M.translation
    # Local axes in world space
    du = (M @ Vector((1, 0, 0))) - center
    du_unit = du.normalized()
    dv = (M @ Vector((0, 0, 1))) - center
    dv_unit = dv.normalized()
    half_w = du.length
    half_h = dv.length

    print(f'    dict(name=\'{name}\', img=dimg[\'{name}\'],')
    print(f'         center=Vector(({center.x:+.3f}, {center.y:+.3f}, {center.z:+.3f})),')
    print(f'         du=Vector(({du_unit.x:+.3f}, {du_unit.y:+.3f}, {du_unit.z:+.3f})),')
    print(f'         dv=Vector(({dv_unit.x:+.3f}, {dv_unit.y:+.3f}, {dv_unit.z:+.3f})),')
    print(f'         half_w={half_w:.2f}, half_h={half_h:.2f}),')
print()
