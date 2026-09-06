# İlim Yuvası — Sosyal Pomodoro Web Uygulaması 📚⏱️

Python CustomTkinter masaüstü Pomodoro V0.3 uygulamasının tüm çekirdek işlevleri, veritabanı mantığı ve estetiği korunarak; **React 19 + TypeScript + Tailwind CSS** ile modern, çok kullanıcılı bir **sosyal çalışma ve odaklanma ortamına** dönüştürülmüş halidir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🏛️ İlim Yuvası Salonu & 4 Kişilik Masalar
- 8 adet 4 kişilik ahşap çalışma masası, yeşil deri sümen (`desk-mat`), vintage pirinç bankacı lambaları (`lamp-glow`) ve sessiz kütüphane dekoru.
- Boş bir sandalyeye tıklayarak oturma, pomodoro süresini seçme ve başlatma.
- Masada çalışan diğer kullanıcıları **canlı animasyonlu karakterler** olarak görme (body-doubling / co-working odak deneyimi).
- Sandalye üstünde canlı minik pomodoro süre halkası ve odaklanılan görev etiketi.
- Kütüphane sessizliğini bozmayan **emoji mikro-etkileşimleri** (👋, ☕, 🔥, 👏, 📖, ✨).
- Dahili Web Audio API ile sıfır harici dosya yüküyle üretilen **Ortam Sesleri**: Cama Vuran Yağmur, Şömine Çatırtısı, Sessiz Salon Mırıltısı.

### 2. 🎨 Modüler Katmanlı SVG Avatar Stüdyosu
- Modüler vektörel karakter motoru (Sıfır ağır oyun motoru yükü, Retina/4K ekranlarda sonsuz keskinlik).
- 5 ten rengi tonu, 8 saç modeli, 8 saç rengi, 6 kıyafet türü ve 8 rengi, gözlük/kulaklık aksesuarları ve masaüstü eşyaları (sıcak kahve, çay, laptop, kitap yığını, sukulent bitki).
- Canlı 3 animasyon durumu: Boşta (`idle`), odaklanmış çalışma/yazı yazma (`anim-typing`), molada fincan yudumlama (`anim-sip`).
- Karakter Tasarım Stüdyosu (`AvatarCustomizer`): Canlı animasyon önizlemesi ve tek tıkla rastgele karakter oluşturucu.

### 3. ⏱️ Masaüstünden Birebir Aktarılan Pomodoro Motoru
- **Analog Saat (`AnalogClock`):** Python CustomTkinter versiyonundaki beyaz çember, saat işaretleri, dakika ibresi (`#59A5CF`), kırmızı saniye ibresi ve merkez pivot noktasıyla birebir uyumlu canvas çizimi.
- **Dijital Saat:** Geniş fontlu canlı sayaç ("25:00").
- **Dinamik Arka Plan Baloncukları (`FloatingBubbles`):** Masaüstü versiyonundaki 20 adet optimize yüzen baloncuk animasyonu.
- **Ardışık Çalışma ↔ Mola Döngüsü:** Çalışma süresi bitince otomatik mola başlatma, seans bitiş zili ve konfeti kutlaması.
- **5 Renk Teması:** Varsayılan (`#1E1E2E`), Mavi (`#0F172A`), Yeşil (`#14271A`), Kırmızı (`#2C1111`), Mor (`#1E112A`).
- **Ses Ayarları & Özel Ses Yükleme:** Dahili uyarı alarmı, bip sesi, köpek sesi ve meditasyon zili + kullanıcının kendi ses dosyasını (`.mp3`, `.wav`) tarayıcıya yükleyip seçebilmesi.

### 4. 📜 Geçmiş, Takvim, Hedefler ve İstatistikler
- **Geçmiş (History):** İki panelli tarih listesi ve seans detay kartları (İş tanımı, süre, başlangıç-bitiş saatleri, seans türü).
- **Takvim (Calendar):** Otomatik formatlanan GG/AA/YYYY ve SS:DD girişleri, geçmiş tarih koruması, canlı geri sayım ("X ay, Y gün kaldı" / "Geçti").
- **Hedefler (Goals):** Tarih gezgini (`< Önceki`, `Bugün`, `Sonraki >`), Görev Bazlı yapılacaklar listesi ve Süre Bazlı hedef belirleme, geçmiş günlerin başarı raporları.
- **İstatistikler (Stats):** Günlük, Haftalık, Aylık ve Yıllık periyotlar; 4 özet kartı (Toplam Süre, Ortalama, En İyi Gün, Aktif Gün Sayısı) ve dinamik aktivite çubuk grafiği (bugünün çubuğu yeşil, diğerleri mavi).

---

## 🚀 Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama tarayıcınızda açılacaktır. İki farklı sekme açarak kütüphanede aynı anda masaya oturup gerçek zamanlı animasyonları hemen test edebilirsiniz!

---

## 🌐 GitHub Pages Üzerinde Dağıtım (Deploy)

Uygulama, kalıcı bir Node.js sunucusuna ihtiyaç duymadan **GitHub Pages** üzerinde statik olarak çalışacak şekilde (`base: './'`) tasarlanmıştır:

1. Depoyu GitHub'a push edin:
   ```bash
   git add .
   git commit -m "feat: İlim Yuvası tam sürüm"
   git push origin main
   ```
2. `.github/workflows/deploy.yml` dosyasındaki GitHub Actions iş akışı otomatik olarak tetiklenir, projeyi derler ve `github-pages` dalına dağıtır.
3. GitHub deponuzun **Settings -> Pages** menüsünde Source olarak **GitHub Actions** seçildiğinden emin olun.

---

## 🔥 Firebase Kurulum Adımları (Adım Adım Rehber)

Uygulama, Firebase bilgileri girilmemiş olsa dahi **Çoklu-Sekme Yerel Senkronizasyon (BroadcastChannel)** moduyla tam fonksiyonel çalışır. Gerçek zamanlı bulut eşzamanlaması ve kullanıcı hesapları için aşağıdaki adımları izleyin:

### Adım 1: Firebase Projesi Oluşturma
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin ve Google hesabınızla giriş yapın.
2. **"Proje ekle"** (Add project) butonuna tıklayın.
3. Proje adını girin (Örn: `ilim-yuvasi`). Google Analytics isteğe bağlıdır; adımları tamamlayıp projeyi oluşturun.

### Adım 2: Web Uygulaması Ekleyin ve Yapılandırma Bilgilerini Alın
1. Proje genel bakış sayfasında **Web (`</>`)** simgesine tıklayın.
2. Uygulama takma adı girin (Örn: `Ilim Yuvasi Web`).
3. Size verilen `firebaseConfig` objesindeki bilgileri kopyalayın:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Adım 3: Authentication (Kimlik Doğrulama) Aktifleştirme
1. Sol menüden **Build -> Authentication** sekmesine gidin ve **"Başlayın"** (Get Started) deyin.
2. **Sign-in method** sekmesinden:
   - **E-posta/Şifre (Email/Password):** Tıklayıp **"Etkinleştir"** yapın ve kaydedin.
   - **Google:** İsteğe bağlı olarak etkinleştirip destek e-postanızı seçin.

### Adım 4: Cloud Firestore Veritabanını Oluşturma
1. Sol menüden **Build -> Firestore Database** sekmesine gidin ve **"Veritabanı oluştur"** deyin.
2. Konum olarak `eur3 (europe-west)` veya size en yakın bölgeyi seçin.
3. Güvenlik kuralları için **Test modunda başlat** veya aşağıdaki üretim kurallarını yapıştırın:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Adım 5: Realtime Database (Canlı Masa Presence Katmanı)
1. Sol menüden **Build -> Realtime Database** sekmesine gidin ve **"Veritabanı oluştur"** deyin.
2. Konum olarak Belçika (`europe-west1`) veya ABD seçebilirsiniz.
3. Kurallar (**Rules**) sekmesine gidin ve aşağıdaki kuralı yapıştırıp **"Yayınla"** (Publish) deyin:
   ```json
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
4. Veritabanı URL'sini kopyalayın (Örn: `https://ilim-yuvasi-default-rtdb.europe-west1.firebasedatabase.app`).

### Adım 6: Bilgileri Uygulamaya Tanımlama (İki Kolay Yol)
- **Yol A (Uygulama İçinden - En Kolayı):**
  Uygulamayı açın, sağ üstteki profil simgesine tıklayın -> **"Bulut"** sekmesine geçin -> Firebase bilgilerinizi yapıştırıp **"Kaydet ve Bağlan"** butonuna basın!
- **Yol B (.env Dosyası ile):**
  Proje dizinindeki `.env.example` dosyasını kopyalayıp `.env` adıyla kaydedin ve bilgileri yazın:
  ```env
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=ilim-yuvasi.firebaseapp.com
  VITE_FIREBASE_DATABASE_URL=https://ilim-yuvasi-default-rtdb.europe-west1.firebasedatabase.app
  VITE_FIREBASE_PROJECT_ID=ilim-yuvasi
  VITE_FIREBASE_STORAGE_BUCKET=ilim-yuvasi.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
  ```
