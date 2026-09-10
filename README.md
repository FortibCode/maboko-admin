# Maboko — Back-office administrateur

Interface de pilotage de la plateforme Maboko (§5.4 du cahier de charges).

Next.js 16 · React 19 · TypeScript · Tailwind CSS

---

## Installation

```bash
npm install
cp .env.example .env.local     # renseigner l'adresse de l'API
npm run dev                    # http://localhost:3000
```

L'API Laravel doit tourner en parallèle :

```bash
cd ../maboko-backend && php artisan serve
```

---

## Accès

La connexion se fait avec un compte dont le rôle est `admin` ou `super_admin`.
Le seeder de l'API en crée un : `admin@maboko.cg` / `password`.

Un compte d'un autre rôle est refusé dès l'écran de connexion, sans attendre
le premier appel protégé.

**L'API reste l'autorité.** La garde côté navigateur ne fait qu'éviter un
écran vide : chaque endpoint `/admin/*` vérifie le rôle et refuse un jeton
non administrateur. Contourner l'interface ne donne accès à rien.

---

## Écrans

| Écran | Réf. | Ce qu'il permet |
|---|---|---|
| Tableau de bord | §5.4.1 | Indicateurs temps réel, activité sur 7 ou 30 jours, file d'attente |
| Artisans | §5.4.3 | Valider, refuser, suspendre ; recherche et filtres |
| Chauffeurs | §5.4.3 | Valider permis et véhicule, suspendre |
| Modération | §5.4.2 | Traiter les signalements, sur pièce |
| Identités | §4.5 | Examiner les pièces, accorder le badge « Profil vérifié » |
| Litiges | §3.4 | Prendre en charge, résoudre, clore |
| Finances | §5.4.4 | Revenus, commissions, répartition par formule, export CSV |

---

## Traçabilité

Toute action qui modifie un compte ou supprime un contenu est journalisée
côté API dans la table `audit_logs` : auteur, horodatage, adresse IP, et
l'état avant et après. Suspendre un compte ou supprimer une publication sont
des décisions opposables — elles doivent rester démontrables.

---

## Vérifications avant de pousser

```bash
npm run typecheck    # TypeScript strict
npm run lint
npm run build
npm audit
```

---

## Deux points à connaître

**Les pièces d'identité** ne transitent jamais par une URL devinable. L'API
délivre des liens signés valables dix minutes ; passé ce délai, il faut
recharger la liste.

**L'export financier** est un CSV à séparateur point-virgule avec BOM UTF-8 :
c'est ce qu'attend un tableur configuré en français, où la virgule sert de
séparateur décimal.
