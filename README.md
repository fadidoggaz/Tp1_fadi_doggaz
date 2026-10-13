# TP1 — Authentification Next.js / TypeScript / Prisma

Correction fondée sur le support TP1_Authentification_NextJS_TypeScript_Prisma_3h.pptx.

## Démarrage

Depuis `tp-auth` :

```powershell
npm install
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Reporter le secret généré dans AUTH_SECRET du fichier .env (au moins 32 octets).
Ne pas écraser un .env existant. DATABASE_URL utilise SQLite : file:./dev.db.

```powershell
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Ouvrir http://localhost:3000. Vérification : `npm run lint` et `npm run build`.
Les dépendances sont installées dans tp-auth, indépendamment du package.json du dossier parent.

## Parcours et responsabilités

- /register : nom (2 à 80 caractères), email et mot de passe (8 caractères minimum, 72 octets maximum pour bcrypt).
- Server Action register : validation Zod, normalisation email, bcrypt coût 12, création Prisma, puis redirection vers /login.
- /login : bcrypt.compare, session signée HS256 avec jose, puis /dashboard.
- Cookie session : HttpOnly, SameSite=Lax, Secure en production, expiration de deux heures.
- /dashboard : getCurrentUser vérifie signature, expiration et session en base côté serveur. Seuls id, nom et email sont sélectionnés.
- Déconnexion : révocation de la session en base, suppression du cookie et redirection vers /login.
- POST /api/auth/register reste disponible pour les clients JSON : même validation, réponse 201 sans connexion automatique.

Le formulaire utilise useActionState pour afficher les erreurs et désactiver le bouton pendant l'envoi.
TypeScript vérifie les types au développement ; Zod valide réellement les données reçues à l'exécution.
Prisma reste dans la logique serveur. Aucun mot de passe ou hash n'est envoyé au navigateur.

## Choix par rapport aux diapositives

Le support mélange password et passwordHash, ainsi que plusieurs configurations Prisma.
Cette correction utilise systématiquement passwordHash et conserve Prisma 6 installé,
avec son client généré dans src/generated/prisma, sans imposer l'adaptateur SQLite d'une autre configuration.
La migration renomme la colonne existante sans supprimer les comptes ; elle ajoute role (USER par défaut)
et Session, conformément au modèle du support. Le rôle ne constitue pas une autorisation administrateur.
Le JWT contient un identifiant de session, vérifié en base pour permettre sa révocation.

AUTH_SECRET remplace JWT_SECRET. Les fichiers .env et les bases locales sont ignorés par Git.
Le code généré par Prisma est exclu d'ESLint et doit être régénéré après une modification du schéma.

## Matrice de tests

| Cas | Résultat attendu |
| --- | --- |
| Inscription valide | Compte créé, hash bcrypt en base, redirection /login |
| Nom court, email invalide, mot de passe court | Erreur de validation, aucune création |
| Email déjà utilisé (y compris casse différente) | Erreur contrôlée |
| Email inconnu ou mauvais mot de passe | Même message : Identifiants invalides |
| Connexion valide | Cookie session et redirection /dashboard |
| Dashboard sans cookie | Redirection /login |
| Dashboard avec session valide | Nom et email affichés |
| Cookie altéré ou expiré | Redirection /login |
| Déconnexion | Cookie supprimé, session révoquée, dashboard inaccessible |
| Réutilisation du cookie après déconnexion | Redirection /login |

Inspecter les données avec `npx prisma studio`. Le hash commence par $2 et diffère du mot de passe.
Les extensions proposées à la fin du support (profil, rotation, limitation des tentatives, etc.) restent des exercices facultatifs.
