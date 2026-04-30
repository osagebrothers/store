"""Open the cap in Blender with editable decal markers.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender \\
      -P /Users/z/work/osage/store/scripts/blender_decal_editor.py

This opens Blender (NOT headless) with:
  - The baseball cap mesh imported
  - One Empty per decal at its current center, named decal_<name>
  - Each Empty's local Y axis = du, Z axis = dv (rotation captures decal axes)
  - Each Empty's scale = (half_w, half_w, half_h) so resizing scales the decal
  - A reference plane child showing the decal image as a textured plane

You move / rotate / scale each Empty in the viewport.

When done, save the .blend (File → Save) to:
  /Users/z/work/osage/store/scripts/cap_decals.blend

Then run:
  /Applications/Blender.app/Contents/MacOS/Blender -b \\
      /Users/z/work/osage/store/scripts/cap_decals.blend \\
      -P /Users/z/work/osage/store/scripts/blender_decal_sync.py

That sync script reads the Empty transforms and updates
scripts/bake_cap_decals.py with the new center/du/dv/half_w/half_h values.
"""
import bpy
import os
from mathutils import Vector, Matrix, Euler

GLB = '/Users/z/work/osage/store/public/models/baseball_cap.glb'
PUB = '/Users/z/work/osage/store/public/images'
SAVE = '/Users/z/work/osage/store/scripts/cap_decals.blend'

# Reset and import cap
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

# Decal config — match what's in bake_cap_decals.py
DECALS = [
    dict(name='mega', img=f'{PUB}/mega_front_text.png',
         center=(0.0, +3.5, 2.0),
         du=(+1, 0, 0), dv=(0, 0, 1),
         half_w=2.6, half_h=2.6/2.515),
    dict(name='panda', img=f'{PUB}/panda_decal.png',
         center=(-3.7, 0.0, 1.8),
         du=(0, -1, 0), dv=(0, 0, 1),
         half_w=1.1, half_h=1.1),
    dict(name='eagle', img=f'{PUB}/eagle_decal.png',
         center=(+3.7, 0.0, 1.8),
         du=(0, +1, 0), dv=(0, 0, 1),
         half_w=1.1, half_h=1.1),
    dict(name='feathers', img=f'{PUB}/feathers_decal.png',
         center=(0.0, -3.7, 1.8),
         du=(+1, 0, 0), dv=(0, 0, 1),
         half_w=1.4, half_h=1.4),
    dict(name='inside', img=f'{PUB}/inside_label.png',
         center=(0.0, -3.0, 2.0),
         du=(+1, 0, 0), dv=(0, 0, 1),
         half_w=1.5, half_h=1.5*361/512),
]

def make_decal_empty(d):
    """Create an Empty with a textured child plane for visual editing."""
    name = f'decal_{d["name"]}'

    # Empty for transform handle
    bpy.ops.object.empty_add(type='ARROWS', radius=0.5, location=d['center'])
    empty = bpy.context.active_object
    empty.name = name

    # Compute orientation matrix: empty's local +X = du, +Z = dv, +Y = du×dv
    du = Vector(d['du']).normalized()
    dv = Vector(d['dv']).normalized()
    dw = du.cross(dv).normalized()
    # Build 3x3 rotation matrix with columns = du, dw, dv (X, Y, Z)
    M = Matrix((
        (du.x, dw.x, dv.x),
        (du.y, dw.y, dv.y),
        (du.z, dw.z, dv.z),
    ))
    empty.rotation_mode = 'XYZ'
    empty.rotation_euler = M.to_euler()

    # Scale: x = half_w, z = half_h, y = thin
    empty.scale = (d['half_w'], 0.05, d['half_h'])

    # Add a textured plane as a CHILD that visualizes the decal
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0, 0, 0))
    plane = bpy.context.active_object
    plane.name = f'plane_{d["name"]}'
    plane.parent = empty
    plane.matrix_parent_inverse = empty.matrix_world.inverted()
    # Plane lies in XY by default; we need it in XZ (so X=du, Z=dv).
    # Rotate plane -90° around X.
    plane.rotation_euler = (1.5708, 0, 0)

    # Material with image texture (alpha enabled)
    mat = bpy.data.materials.new(name=f'mat_{d["name"]}')
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    out.location = (400, 0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (200, 0)
    img_node = nt.nodes.new('ShaderNodeTexImage')
    img_node.location = (-100, 0)
    if os.path.exists(d['img']):
        img_node.image = bpy.data.images.load(d['img'])
    nt.links.new(img_node.outputs['Color'], bsdf.inputs['Base Color'])
    nt.links.new(img_node.outputs['Alpha'], bsdf.inputs['Alpha'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    plane.data.materials.append(mat)

    return empty

print('Creating decal editing handles...')
for d in DECALS:
    make_decal_empty(d)
    print(f'  decal_{d["name"]} at {d["center"]}')

# Set up viewport for nicer interactive editing
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.shading.type = 'MATERIAL'
                space.shading.use_scene_lights = True
                space.clip_end = 1000

# Save the .blend file
os.makedirs(os.path.dirname(SAVE), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=SAVE)
print(f'\nSaved {SAVE}')
print('\nNow:')
print('  1. Move / rotate / scale each decal_<name> Empty in the viewport')
print('  2. File → Save (overwrites cap_decals.blend)')
print('  3. Run: /Applications/Blender.app/Contents/MacOS/Blender -b \\')
print(f'           {SAVE} -P /Users/z/work/osage/store/scripts/blender_decal_sync.py')
print('     to write the new positions into bake_cap_decals.py')
