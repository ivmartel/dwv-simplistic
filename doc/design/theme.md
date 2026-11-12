# Theme

Inspired from [Material Design 3](https://m3.material.io/) and its [color roles](https://m3.material.io/styles/color/roles). Mainly using surface, primary, secondary and outline.

## Surface

> Use surface roles for more neutral backgrounds, and container colors for components like cards, sheets, and dialogs.

- Surface: Default color for backgrounds
- On surface: Text and icons against any surface or surface container color
- Surface container: Default container color
- Surface container high: High-emphasis container color

-> 'surface' for main background, 'surface container' for table and panels, ''surface container high' for elements on top of 'surface container'

## Primary

> Use primary roles for the most prominent components across the UI, such as the FAB, high-emphasis buttons, and active states.

- Primary: High-emphasis fills, texts, and icons against surface
- On primary: Text and icons against primary
- Primary container: Standout fill color against surface, for key components like FAB
- On primary container: Text and icons against primary container

-> 'primary' for buttons, 'primary container' for selected buttons and selected elements border

Note: primary colors have to be visible on all types of surface.

Additional accent:

- Primary: pressed toggle icons (`aria-pressed="true"`) in the annotation list

## Secondary

> Use secondary roles for less prominent components in the UI such as filter chips.

- Secondary container: Fill color for selected list items
- On secondary container: Text and icons against secondary container

-> selected annotation in the annotation list

## Surface variant and inverse

- On surface variant: secondary text (empty list, quantification labels)
- Inverse surface / inverse on surface: snackbar

## Outline

> There are two outline colors to be used against a surface:

- Outline: Important boundaries, such as a text field outline

-> drop box contour

Note: outline color has be visible on all types of surface.
