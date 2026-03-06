# FreshAlert

## Current State
- App de control de caducidad de alimentos con dashboard, gestión de alimentos y recetas
- Backend en Motoko con datos de muestra: alimentos con categorías en inglés ("Dairy", "Meat", "Vegetable", etc.) que no coinciden con los filtros del frontend (español)
- Página de Recetas con dos secciones: "Recomendadas para ti" y "Todas las recetas"
- 7 recetas de muestra en inglés/español mezclado

## Requested Changes (Diff)

### Add
- 15 nuevas recetas universales en español en datos de muestra del backend (con tags para categorización)
- Sección "Receta del día" en la página Recetas (rotación diaria basada en fecha)
- Sección "Recetas rápidas" (tag: "rápida", < 15 min)
- Sección "Recetas saludables" (tag: "saludable")
- Sección "Recetas para niños" (tag: "niños")

### Modify
- Corregir categorías de alimentos de muestra en el backend: de inglés ("Dairy", "Meat", "Vegetable", "Fruit", "Other") a español ("Lácteos", "Carnes", "Verduras", "Frutas", y categorías correctas del frontend)
- Actualizar ingredientes de recetas de muestra al español para que el sistema de recomendación funcione correctamente
- Reorganizar página Recetas con las nuevas secciones visuales

### Remove
- Nada

## Implementation Plan
1. Actualizar main.mo: corregir categorías de alimentos a español, expandir recetas de muestra con las 15 nuevas y tags adecuados
2. Actualizar Recetas.tsx: añadir secciones "Receta del día", "Por caducar", "Rápidas", "Saludables", "Para niños" con lógica de filtrado por tags
3. Validar y desplegar
