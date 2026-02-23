# Configuration des Variables d'Environnement

## 📝 Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://igyolvupmiohrxaqtayc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneW9sdnVwbWlvaHJ4YXF0YXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTk2NzAsImV4cCI6MjA4NzM3NTY3MH0.Ziq9NQCLD-Lnk5Tqyktf-HOyjCMchv3mb12Pr92uCeI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneW9sdnVwbWlvaHJ4YXF0YXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc5OTY3MCwiZXhwIjoyMDg3Mzc1NjcwfQ.cp9LWaza274GQnPxQtHBVqLHac6J052HG43r3obF0Xk

# WasenderAPI
WASENDER_API_KEY=76a32406ad673c8b1c4a1af0649d9a95dc548308824e430963b747f9925809b8
WASENDER_API_URL=https://www.wasenderapi.com/api
```

## ⚠️ Important

- Le fichier `.env.local` est dans `.gitignore` et ne sera pas commité
- Ne partagez jamais ces clés publiquement
- Pour la production (Vercel), ajoutez ces variables dans les paramètres du projet

## ✅ Vérification

Après avoir créé le fichier, redémarrez le serveur de développement :

```bash
npm run dev
```

