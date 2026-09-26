# Configuration MySQL — Sokho Viandes

## Option XAMPP
1. Lance Apache et MySQL depuis XAMPP.
2. Ouvre phpMyAdmin.
3. Crée `sokho_viandes`.
4. Mets tes identifiants dans `backend/.env`.
5. Depuis `backend`, lance `npm run prisma:push`.

## URL locale typique

Si MySQL XAMPP utilise root sans mot de passe :

```env
DATABASE_URL="mysql://root:@localhost:3306/sokho_viandes"
```

Si un mot de passe existe :

```env
DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/sokho_viandes"
```

Ne mets jamais `.env` dans Git.
