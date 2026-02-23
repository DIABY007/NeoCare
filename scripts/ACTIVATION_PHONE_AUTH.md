# 📱 Activation de l'Authentification par Téléphone dans Supabase

Pour que l'authentification OTP par téléphone fonctionne, vous devez configurer Supabase.

## ⚙️ Configuration dans Supabase Dashboard

### 1. Activer l'authentification par téléphone

1. **Ouvrir le Dashboard Supabase**
   - Allez sur : https://supabase.com/dashboard/project/igyolvupmiohrxaqtayc
   - Connectez-vous si nécessaire

2. **Accéder aux paramètres d'authentification**
   - Menu gauche : **"Authentication"** > **"Providers"**
   - Ou **"Authentication"** > **"Settings"**

3. **Activer Phone Provider**
   - Cherchez **"Phone"** dans la liste des providers
   - Activez le toggle **"Enable Phone provider"**
   - Sauvegardez

### 2. Configurer un provider SMS (Optionnel pour le MVP)

**Note** : Pour le MVP, nous utilisons WasenderAPI pour envoyer les OTP via WhatsApp, donc vous n'avez pas besoin de configurer un provider SMS dans Supabase.

Cependant, si vous voulez tester avec Supabase directement :

- **Twilio** : Nécessite un compte Twilio et des crédits
- **MessageBird** : Nécessite un compte MessageBird
- **Vonage** : Nécessite un compte Vonage

### 3. Configuration pour WasenderAPI (Notre choix)

Comme nous utilisons WasenderAPI pour envoyer les OTP via WhatsApp, nous n'avons pas besoin de configurer un provider SMS dans Supabase.

**Notre workflow** :
1. L'utilisateur entre son numéro de téléphone
2. Notre application génère un code OTP
3. WasenderAPI envoie le code via WhatsApp
4. L'utilisateur entre le code
5. Nous vérifions le code et créons/connectons la session Supabase

## 🔧 Alternative : Utiliser Supabase Auth Phone directement

Si vous préférez utiliser l'authentification par téléphone native de Supabase :

1. **Activer Phone Provider** (voir ci-dessus)
2. **Configurer un provider SMS** (Twilio, MessageBird, etc.)
3. **Utiliser l'API Supabase Auth** :
   ```typescript
   // Envoyer l'OTP
   const { data, error } = await supabase.auth.signInWithOtp({
     phone: '+22656636039'
   })
   
   // Vérifier l'OTP
   const { data, error } = await supabase.auth.verifyOtp({
     phone: '+22656636039',
     token: '123456'
   })
   ```

## ✅ Vérification

Pour vérifier que l'authentification par téléphone est activée :

1. Allez dans **Authentication** > **Providers**
2. Vérifiez que **Phone** est activé (toggle vert)
3. Testez en créant un utilisateur avec uniquement un téléphone

## 📝 Notes

- Pour le MVP, nous utilisons **WasenderAPI** pour l'envoi d'OTP via WhatsApp
- L'authentification par téléphone dans Supabase est optionnelle si vous gérez l'OTP vous-même
- Le téléphone doit être au format **E.164** (ex: `+22656636039`)
- Le champ `phone_confirmed` doit être `true` pour que l'utilisateur puisse se connecter

