# Firebase Storage Image Loading Issues - Troubleshooting Guide

## 🔥 Immediate Steps to Fix Image Loading

### Step 1: Apply Most Permissive Storage Rules (For Testing)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `sabari-cars` project
3. Navigate to **Storage > Rules**
4. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write, delete: if true;
    }
  }
}
```

5. Click **Publish**

### Step 2: Update CORS Configuration
Run this command in your terminal (requires Google Cloud SDK):

```bash
gsutil cors set cors.json gs://sabari-cars.firebasestorage.app
```

If you don't have Google Cloud SDK, follow these steps:
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run: `gcloud auth login`
3. Run: `gcloud config set project sabari-cars`
4. Run the cors command above

### Step 3: Check Firebase Storage Bucket
1. Go to Firebase Console > Storage
2. Verify your bucket name is: `sabari-cars.firebasestorage.app`
3. Check if the images exist in the paths shown in the error logs
4. Look for folders: `vehicles/cars/` and `vehicles/Spares /`

### Step 4: Verify Image URLs
The failing URLs show this pattern:
- `vehicles%2Fcars%2F[filename]` 
- `vehicles%2FSpares%20%2F[filename]`

Check if these exact paths exist in your Firebase Storage.

### Step 5: Alternative - Re-upload Images
If images are missing or corrupted:
1. Go to your vehicle management page
2. Edit each vehicle
3. Re-upload the images
4. Save the vehicle

## 🔍 Debug Information

### Current Error Pattern:
```
Image failed to load: https://firebasestorage.googleapis.com/v0/b/sabari-cars.firebasestorage.app/o/vehicles%2Fcars%2F[filename]?alt=media&token=[token]
```

### Possible Causes:
1. **Storage Rules**: Too restrictive (fixed with step 1)
2. **CORS Issues**: Browser blocking requests (fixed with step 2)
3. **Missing Files**: Images deleted or never uploaded properly
4. **Bucket Configuration**: Wrong bucket name or settings
5. **Token Issues**: Invalid or expired access tokens

### Quick Test:
Try opening one of the failing image URLs directly in your browser. If it loads, the issue is CORS. If it shows "access denied", it's a rules issue.

## 📞 If Still Not Working:
1. Check browser console for detailed error messages
2. Verify Firebase project configuration
3. Ensure you're using the correct Firebase project
4. Try clearing browser cache and cookies
5. Test in incognito/private browsing mode
