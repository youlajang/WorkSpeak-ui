/**
 * Builds signup-login-translations.json from per-locale string arrays.
 * Each locale has 29 strings in order: login (5) + signup (24).
 * Run: node scripts/build-signup-login-73.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOGIN_KEYS = ["title", "email", "password", "submit", "error"];
const SIGNUP_KEYS = [
  "title", "email", "password", "confirmPassword", "nickname", "photo", "submit", "photoOptional",
  "addPhoto", "placeholderNickname", "placeholderEmail", "placeholderPassword", "placeholderConfirmPassword",
  "checking", "nicknameDuplicate", "nicknameAvailable", "emailInvalid", "emailDuplicate", "emailAvailable",
  "passwordMatch", "passwordMismatch", "cropTitle", "cropHint"
];

function build(localeStrings) {
  const login = {};
  LOGIN_KEYS.forEach((k, i) => { login[k] = localeStrings[i] || ""; });
  const signup = {};
  SIGNUP_KEYS.forEach((k, i) => { signup[k] = localeStrings[LOGIN_KEYS.length + i] || ""; });
  return { login, signup };
}

// 29 strings per locale: login(5) + signup(24). English first.
const EN = [
  "Log in", "Email", "Password", "Log in", "Invalid email or password.",
  "Create your profile", "Email", "Password", "Confirm password", "Nickname", "Profile photo", "Create account", "Optional",
  "Add photo", "Your display name", "you@example.com", "••••••••", "••••••••",
  "Checking…", "This nickname is already in use.", "This nickname is available.",
  "Please enter a valid email address.", "This email is already registered.", "This email is available.",
  "Passwords match.", "Passwords do not match.", "Crop your photo", "Drag to move · Scroll to zoom"
];

const LOCALES = {
  en: EN,
  ko: [
    "로그인", "이메일", "비밀번호", "로그인", "이메일 또는 비밀번호가 올바르지 않습니다.",
    "프로필 만들기", "이메일", "비밀번호", "비밀번호 확인", "닉네임", "프로필 사진", "계정 만들기", "선택",
    "사진 추가", "표시 이름", "you@example.com", "••••••••", "••••••••",
    "확인 중…", "이 닉네임은 이미 사용 중입니다.", "사용 가능한 닉네임입니다.",
    "올바른 이메일 주소를 입력해 주세요.", "이 이메일은 이미 등록되어 있습니다.", "사용 가능한 이메일입니다.",
    "비밀번호가 일치합니다.", "비밀번호가 일치하지 않습니다.", "사진 잘라내기", "드래그로 이동 · 스크롤로 확대/축소"
  ],
  ja: [
    "ログイン", "メール", "パスワード", "ログイン", "メールまたはパスワードが正しくありません。",
    "プロフィールを作成", "メール", "パスワード", "パスワード確認", "ニックネーム", "プロフィール写真", "アカウント作成", "任意",
    "写真を追加", "表示名", "you@example.com", "••••••••", "••••••••",
    "確認中…", "このニックネームは既に使用されています。", "このニックネームは使用できます。",
    "有効なメールアドレスを入力してください。", "このメールは既に登録されています。", "このメールは使用できます。",
    "パスワードが一致しています。", "パスワードが一致しません。", "写真を切り取り", "ドラッグで移動・スクロールでズーム"
  ],
  zh: [
    "登录", "邮箱", "密码", "登录", "邮箱或密码不正确。",
    "创建您的个人资料", "邮箱", "密码", "确认密码", "昵称", "个人照片", "创建账户", "选填",
    "添加照片", "您的显示名称", "you@example.com", "••••••••", "••••••••",
    "检查中…", "该昵称已被使用。", "该昵称可用。",
    "请输入有效的邮箱地址。", "该邮箱已注册。", "该邮箱可用。",
    "密码一致。", "密码不一致。", "裁剪照片", "拖动移动 · 滚轮缩放"
  ],
  "zh-TW": [
    "登入", "電子郵件", "密碼", "登入", "電子郵件或密碼不正確。",
    "建立您的個人檔案", "電子郵件", "密碼", "確認密碼", "暱稱", "個人照片", "建立帳戶", "選填",
    "新增照片", "您的顯示名稱", "you@example.com", "••••••••", "••••••••",
    "檢查中…", "此暱稱已被使用。", "此暱稱可用。",
    "請輸入有效的電子郵件地址。", "此電子郵件已註冊。", "此電子郵件可用。",
    "密碼一致。", "密碼不一致。", "裁剪照片", "拖曳移動 · 滾輪縮放"
  ],
  es: [
    "Iniciar sesión", "Correo", "Contraseña", "Iniciar sesión", "Correo o contraseña no válidos.",
    "Crea tu perfil", "Correo", "Contraseña", "Confirmar contraseña", "Apodo", "Foto de perfil", "Crear cuenta", "Opcional",
    "Añadir foto", "Tu nombre para mostrar", "you@example.com", "••••••••", "••••••••",
    "Comprobando…", "Este apodo ya está en uso.", "Este apodo está disponible.",
    "Introduce un correo válido.", "Este correo ya está registrado.", "Este correo está disponible.",
    "Las contraseñas coinciden.", "Las contraseñas no coinciden.", "Recortar foto", "Arrastra para mover · Rueda para zoom"
  ],
  fr: [
    "Connexion", "E-mail", "Mot de passe", "Connexion", "E-mail ou mot de passe incorrect.",
    "Créez votre profil", "E-mail", "Mot de passe", "Confirmer le mot de passe", "Pseudo", "Photo de profil", "Créer un compte", "Optionnel",
    "Ajouter une photo", "Votre nom affiché", "you@example.com", "••••••••", "••••••••",
    "Vérification…", "Ce pseudo est déjà utilisé.", "Ce pseudo est disponible.",
    "Veuillez entrer une adresse e-mail valide.", "Cet e-mail est déjà enregistré.", "Cet e-mail est disponible.",
    "Les mots de passe correspondent.", "Les mots de passe ne correspondent pas.", "Recadrer la photo", "Glisser pour déplacer · Molette pour zoomer"
  ],
  de: [
    "Anmelden", "E-Mail", "Passwort", "Anmelden", "E-Mail oder Passwort ungültig.",
    "Profil erstellen", "E-Mail", "Passwort", "Passwort bestätigen", "Spitzname", "Profilfoto", "Konto erstellen", "Optional",
    "Foto hinzufügen", "Ihr Anzeigename", "you@example.com", "••••••••", "••••••••",
    "Wird geprüft…", "Dieser Spitzname ist bereits vergeben.", "Dieser Spitzname ist verfügbar.",
    "Bitte gültige E-Mail-Adresse eingeben.", "Diese E-Mail ist bereits registriert.", "Diese E-Mail ist verfügbar.",
    "Passwörter stimmen überein.", "Passwörter stimmen nicht überein.", "Foto zuschneiden", "Ziehen zum Verschieben · Scrollen zum Zoomen"
  ],
  pt: [
    "Entrar", "E-mail", "Palavra-passe", "Entrar", "E-mail ou palavra-passe inválidos.",
    "Criar o seu perfil", "E-mail", "Palavra-passe", "Confirmar palavra-passe", "Alcunha", "Foto de perfil", "Criar conta", "Opcional",
    "Adicionar foto", "O seu nome a exibir", "you@example.com", "••••••••", "••••••••",
    "A verificar…", "Esta alcunha já está a ser usada.", "Esta alcunha está disponível.",
    "Introduza um e-mail válido.", "Este e-mail já está registado.", "Este e-mail está disponível.",
    "As palavras-passe coincidem.", "As palavras-passe não coincidem.", "Recortar foto", "Arrastar para mover · Scroll para zoom"
  ],
  "pt-BR": [
    "Entrar", "E-mail", "Senha", "Entrar", "E-mail ou senha inválidos.",
    "Crie seu perfil", "E-mail", "Senha", "Confirmar senha", "Apelido", "Foto de perfil", "Criar conta", "Opcional",
    "Adicionar foto", "Seu nome de exibição", "you@example.com", "••••••••", "••••••••",
    "Verificando…", "Este apelido já está em uso.", "Este apelido está disponível.",
    "Digite um e-mail válido.", "Este e-mail já está registrado.", "Este e-mail está disponível.",
    "As senhas coincidem.", "As senhas não coincidem.", "Recortar foto", "Arrastar para mover · Scroll para zoom"
  ],
  ar: [
    "تسجيل الدخول", "البريد الإلكتروني", "كلمة المرور", "تسجيل الدخول", "البريد أو كلمة المرور غير صحيحة.",
    "إنشاء ملفك الشخصي", "البريد الإلكتروني", "كلمة المرور", "تأكيد كلمة المرور", "اللقب", "صورة الملف", "إنشاء حساب", "اختياري",
    "إضافة صورة", "اسم العرض", "you@example.com", "••••••••", "••••••••",
    "جاري التحقق…", "هذا اللقب مستخدم بالفعل.", "هذا اللقب متاح.",
    "أدخل بريداً إلكترونياً صالحاً.", "هذا البريد مسجل مسبقاً.", "هذا البريد متاح.",
    "كلمتا المرور متطابقتان.", "كلمتا المرور غير متطابقتين.", "اقتصاص الصورة", "اسحب للنقل · تمرير للتكبير"
  ],
  ru: [
    "Войти", "Эл. почта", "Пароль", "Войти", "Неверная почта или пароль.",
    "Создайте профиль", "Эл. почта", "Пароль", "Подтвердите пароль", "Ник", "Фото профиля", "Создать аккаунт", "Необязательно",
    "Добавить фото", "Ваше отображаемое имя", "you@example.com", "••••••••", "••••••••",
    "Проверка…", "Этот ник уже занят.", "Этот ник доступен.",
    "Введите действительный адрес почты.", "Эта почта уже зарегистрирована.", "Эта почта доступна.",
    "Пароли совпадают.", "Пароли не совпадают.", "Обрезать фото", "Перетащите для сдвига · Колесо для зума"
  ],
  it: [
    "Accedi", "Email", "Password", "Accedi", "Email o password non validi.",
    "Crea il tuo profilo", "Email", "Password", "Conferma password", "Nickname", "Foto profilo", "Crea account", "Opzionale",
    "Aggiungi foto", "Il tuo nome visualizzato", "you@example.com", "••••••••", "••••••••",
    "Verifica…", "Questo nickname è già in uso.", "Questo nickname è disponibile.",
    "Inserisci un'email valida.", "Questa email è già registrata.", "Questa email è disponibile.",
    "Le password coincidono.", "Le password non coincidono.", "Ritaglia foto", "Trascina per spostare · Scroll per zoom"
  ],
  vi: [
    "Đăng nhập", "Email", "Mật khẩu", "Đăng nhập", "Email hoặc mật khẩu không đúng.",
    "Tạo hồ sơ của bạn", "Email", "Mật khẩu", "Xác nhận mật khẩu", "Biệt danh", "Ảnh đại diện", "Tạo tài khoản", "Tùy chọn",
    "Thêm ảnh", "Tên hiển thị", "you@example.com", "••••••••", "••••••••",
    "Đang kiểm tra…", "Biệt danh này đã được sử dụng.", "Biệt danh này có sẵn.",
    "Vui lòng nhập email hợp lệ.", "Email này đã được đăng ký.", "Email này có sẵn.",
    "Mật khẩu khớp.", "Mật khẩu không khớp.", "Cắt ảnh", "Kéo để di chuyển · Cuộn để phóng to"
  ],
  th: [
    "เข้าสู่ระบบ", "อีเมล", "รหัสผ่าน", "เข้าสู่ระบบ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "สร้างโปรไฟล์ของคุณ", "อีเมล", "รหัสผ่าน", "ยืนยันรหัสผ่าน", "ชื่อเล่น", "รูปโปรไฟล์", "สร้างบัญชี", "ไม่บังคับ",
    "เพิ่มรูป", "ชื่อที่แสดง", "you@example.com", "••••••••", "••••••••",
    "กำลังตรวจสอบ…", "ชื่อเล่นนี้ถูกใช้แล้ว", "ชื่อเล่นนี้ใช้ได้",
    "กรุณากรอกอีเมลที่ถูกต้อง", "อีเมลนี้ลงทะเบียนแล้ว", "อีเมลนี้ใช้ได้",
    "รหัสผ่านตรงกัน", "รหัสผ่านไม่ตรงกัน", "ครอปรูป", "ลากเพื่อเลื่อน · เลื่อนเพื่อซูม"
  ],
  id: [
    "Masuk", "Email", "Kata sandi", "Masuk", "Email atau kata sandi salah.",
    "Buat profil Anda", "Email", "Kata sandi", "Konfirmasi kata sandi", "Nickname", "Foto profil", "Buat akun", "Opsional",
    "Tambah foto", "Nama tampilan Anda", "you@example.com", "••••••••", "••••••••",
    "Memeriksa…", "Nickname ini sudah dipakai.", "Nickname ini tersedia.",
    "Masukkan alamat email yang valid.", "Email ini sudah terdaftar.", "Email ini tersedia.",
    "Kata sandi cocok.", "Kata sandi tidak cocok.", "Pangkas foto", "Seret untuk menggeser · Scroll untuk zoom"
  ],
  nl: [
    "Inloggen", "E-mail", "Wachtwoord", "Inloggen", "Ongeldig e-mailadres of wachtwoord.",
    "Maak je profiel", "E-mail", "Wachtwoord", "Bevestig wachtwoord", "Bijnaam", "Profielfoto", "Account aanmaken", "Optioneel",
    "Foto toevoegen", "Je weergavenaam", "you@example.com", "••••••••", "••••••••",
    "Controleren…", "Deze bijnaam is al in gebruik.", "Deze bijnaam is beschikbaar.",
    "Voer een geldig e-mailadres in.", "Dit e-mailadres is al geregistreerd.", "Dit e-mailadres is beschikbaar.",
    "Wachtwoorden komen overeen.", "Wachtwoorden komen niet overeen.", "Foto bijsnijden", "Slepen om te verplaatsen · Scrollen om te zoomen"
  ],
  pl: [
    "Zaloguj się", "E-mail", "Hasło", "Zaloguj się", "Nieprawidłowy e-mail lub hasło.",
    "Utwórz profil", "E-mail", "Hasło", "Potwierdź hasło", "Nick", "Zdjęcie profilowe", "Utwórz konto", "Opcjonalnie",
    "Dodaj zdjęcie", "Twoja wyświetlana nazwa", "you@example.com", "••••••••", "••••••••",
    "Sprawdzanie…", "Ten nick jest już używany.", "Ten nick jest dostępny.",
    "Wprowadź prawidłowy adres e-mail.", "Ten e-mail jest już zarejestrowany.", "Ten e-mail jest dostępny.",
    "Hasła są zgodne.", "Hasła nie są zgodne.", "Przytnij zdjęcie", "Przeciągnij, aby przesunąć · Przewiń, aby powiększyć"
  ],
  tr: [
    "Giriş yap", "E-posta", "Şifre", "Giriş yap", "E-posta veya şifre hatalı.",
    "Profilinizi oluşturun", "E-posta", "Şifre", "Şifreyi onayla", "Takma ad", "Profil fotoğrafı", "Hesap oluştur", "İsteğe bağlı",
    "Fotoğraf ekle", "Görünen adınız", "you@example.com", "••••••••", "••••••••",
    "Kontrol ediliyor…", "Bu takma ad zaten kullanılıyor.", "Bu takma ad kullanılabilir.",
    "Geçerli bir e-posta adresi girin.", "Bu e-posta zaten kayıtlı.", "Bu e-posta kullanılabilir.",
    "Şifreler eşleşiyor.", "Şifreler eşleşmiyor.", "Fotoğrafı kırp", "Taşımak için sürükleyin · Yakınlaştırmak için kaydırın"
  ],
  uk: [
    "Увійти", "Ел. пошта", "Пароль", "Увійти", "Невірна пошта або пароль.",
    "Створіть профіль", "Ел. пошта", "Пароль", "Підтвердіть пароль", "Нік", "Фото профілю", "Створити обліковий запис", "Необовʼязково",
    "Додати фото", "Ваше відображуване імʼя", "you@example.com", "••••••••", "••••••••",
    "Перевірка…", "Цей нік вже зайнятий.", "Цей нік доступний.",
    "Введіть дійсну адресу пошти.", "Ця пошта вже зареєстрована.", "Ця пошта доступна.",
    "Паролі збігаються.", "Паролі не збігаються.", "Обрізати фото", "Перетягніть для зміщення · Колесо для зума"
  ],
  hi: [
    "लॉग इन करें", "ईमेल", "पासवर्ड", "लॉग इन करें", "ईमेल या पासवर्ड गलत है।",
    "अपनी प्रोफ़ाइल बनाएं", "ईमेल", "पासवर्ड", "पासवर्ड की पुष्टि करें", "उपनाम", "प्रोफ़ाइल फोटो", "खाता बनाएं", "वैकल्पिक",
    "फोटो जोड़ें", "आपका प्रदर्शन नाम", "you@example.com", "••••••••", "••••••••",
    "जाँच हो रही है…", "यह उपनाम पहले से उपयोग में है।", "यह उपनाम उपलब्ध है।",
    "वैध ईमेल पता दर्ज करें।", "यह ईमेल पहले से पंजीकृत है।", "यह ईमेल उपलब्ध है।",
    "पासवर्ड मेल खाते हैं।", "पासवर्ड मेल नहीं खाते।", "फोटो क्रॉप करें", "खिसकाने के लिए खींचें · ज़ूम के लिए स्क्रॉल"
  ],
  he: [
    "התחברות", "אימייל", "סיסמה", "התחברות", "אימייל או סיסמה שגויים.",
    "צור את הפרופיל שלך", "אימייל", "סיסמה", "אישור סיסמה", "כינוי", "תמונת פרופיל", "צור חשבון", "אופציונלי",
    "הוסף תמונה", "שם התצוגה שלך", "you@example.com", "••••••••", "••••••••",
    "בודק…", "כינוי זה כבר בשימוש.", "כינוי זה זמין.",
    "הזן כתובת אימייל תקינה.", "אימייל זה כבר רשום.", "אימייל זה זמין.",
    "הסיסמאות תואמות.", "הסיסמאות לא תואמות.", "חתוך תמונה", "גרור להזזה · גלול לזום"
  ],
  af: ["Meld aan","E-pos","Wagwoord","Meld aan","Ongeldige e-pos of wagwoord.","Skep jou profiel","E-pos","Wagwoord","Bevestig wagwoord","Bynaam","Profielfoto","Skep rekening","Opsioneel","Voeg foto by","Jou vertoonnaam","you@example.com","••••••••","••••••••","Kontroleer…","Hierdie bynaam is reeds in gebruik.","Hierdie bynaam is beskikbaar.","Voer geldige e-pos in.","Hierdie e-pos is reeds geregistreer.","Hierdie e-pos is beskikbaar.","Wagwoorde stem ooreen.","Wagwoorde stem nie ooreen nie.","Sny foto","Sleep om te skuif · Scroll om te zoom"],
  am: ["ግባ","ኢሜይል","ይለፍ ቃል","ግባ","ልክ ያልሆነ ኢሜይል ወይ ይለፍ ቃል።","መገለጥያህን ፍጠር","ኢሜይል","ይለፍ ቃል","ይለፍ ቃል አረጋግጥ","ስም","የመገለጥያ ፎቶ","መለያ ፍጠር","አማራጭ","ፎቶ ጨምር","የማሳያ ስምህ","you@example.com","••••••••","••••••••","በማረጋገጥ ላይ…","ይህ ስም ቀድሞ ጥቅም ላይ ይውላል።","ይህ ስም ይገኛል።","ትክክለኛ ኢሜይል አስገባ።","ይህ ኢሜይል ቀድሞ ተመዝግቧል።","ይህ ኢሜይል ይገኛል።","ይለፍ ቃሎች ይጣጣማሉ።","ይለፍ ቃሎች አይጣጣሙም።","ፎቶ ቁረጭ","ለማንቀሳቀስ ጎትት · ለማጉላት ጠቅላላ ሸብል"],
  as: ["লগ ইন","ইমেইল","পাছৱৰ্ড","লগ ইন","অবৈধ ইমেইল বা পাছৱৰ্ড।","আপোনাৰ প্ৰ’ফাইল সৃষ্টি কৰক","ইমেইল","পাছৱৰ্ড","পাছৱৰ্ড নিশ্চিত কৰক","নিকনেম","প্ৰ’ফাইল ফটো","একাউণ্ট সৃষ্টি কৰক","ঐচ্ছিক","ফটো যোগ কৰক","আপোনাৰ প্ৰদৰ্শন নাম","you@example.com","••••••••","••••••••","পৰীক্ষা কৰি আছে…","এই নিকনেম ইতিমধ্যে ব্যৱহৃত।","এই নিকনেম উপলব্ধ।","বৈধ ইমেইল সুমুৱাওক।","এই ইমেইল ইতিমধ্যে নিবন্ধিত।","এই ইমেইল উপলব্ধ।","পাছৱৰ্ড মিলে।","পাছৱৰ্ড নিমিলে।","ফটো ক্ৰপ কৰক","স্থানান্তৰ টানিব · জুম স্ক্ৰল কৰক"],
  az: ["Daxil ol","Email","Şifrə","Daxil ol","Yanlış email və ya şifrə.","Profilinizi yaradın","Email","Şifrə","Şifrəni təsdiqlə","Ləqəb","Profil şəkli","Hesab yarat","İstəyə bağlı","Şəkil əlavə et","Göstərmə adınız","you@example.com","••••••••","••••••••","Yoxlanılır…","Bu ləqəb artıq istifadədədir.","Bu ləqəb mövcuddur.","Düzgün email daxil edin.","Bu email artıq qeydiyyatdadır.","Bu email mövcuddur.","Şifrələr uyğundur.","Şifrələr uyğun deyil.","Şəkli kəsin","Daşımaq üçün sürükləyin · Zoom üçün scroll"],
  bg: ["Вход","Имейл","Парола","Вход","Невалиден имейл или парола.","Създайте профил","Имейл","Парола","Потвърдете паролата","Псевдоним","Профилна снимка","Създаване на акаунт","По избор","Добави снимка","Вашето показно име","you@example.com","••••••••","••••••••","Проверка…","Този псевдоним вече се използва.","Този псевдоним е наличен.","Въведете валиден имейл.","Този имейл вече е регистриран.","Този имейл е наличен.","Паролите съвпадат.","Паролите не съвпадат.","Изрежете снимка","Плъзнете за преместване · Превъртете за мащаб"],
  bn: ["লগ ইন","ইমেইল","পাসওয়ার্ড","লগ ইন","ইমেইল বা পাসওয়ার্ড ভুল।","প্রোফাইল তৈরি করুন","ইমেইল","পাসওয়ার্ড","পাসওয়ার্ড নিশ্চিত করুন","ডাকনাম","প্রোফাইল ছবি","অ্যাকাউন্ট তৈরি","ঐচ্ছিক","ছবি যোগ করুন","আপনার প্রদর্শন নাম","you@example.com","••••••••","••••••••","যাচাই করা হচ্ছে…","এই ডাকনাম ইতিমধ্যে ব্যবহারে।","এই ডাকনাম উপলব্ধ।","সঠিক ইমেইল দিন।","এই ইমেইল ইতিমধ্যে নিবন্ধিত।","এই ইমেইল উপলব্ধ।","পাসওয়ার্ড মিলে গেছে।","পাসওয়ার্ড মিলছে না।","ছবি ক্রপ করুন","স্থানান্তর করতে টানুন · জুম করতে স্ক্রল করুন"],
  bo: ["ནང་འཛུལ།","གློག་འཕྲིན།","གསང་ཨང་།","ནང་འཛུལ།","གློག་འཕྲིན་ཡང་ན་གསང་ཨང་མི་འཚམ།","ཁྱོད་ཀྱི་སྒེར་ཐོ་གསར་སྐྲུན།","གློག་འཕྲིན།","གསང་ཨང་།","གསང་ཨང་གཏན་འཁེལ།","མིང་གཞན།","སྒེར་ཐོ་པར་རིས།","རྩིས་ཁྲ་གསར་སྐྲུན།","འདེམས་ཆ།","པར་རིས་ཁ་སྣོན།","ཁྱོད་ཀྱི་འཆར་བའི་མིང་།","you@example.com","••••••••","••••••••","ཞིབ་བརྟག་བྱེད་བཞིན་པ།…","མིང་གཞན་འདི་སྔོན་ཟིན་སྤྱོད་ཟིན།","མིང་གཞན་འདི་ལག་ལེན་འཐབ་ཆོག","གློག་འཕྲིན་ཚད་ལྡན་འཇུག","གློག་འཕྲིན་འདི་སྔོན་ཐོ་འགོད་ཟིན།","གློག་འཕྲིན་འདི་ལག་ལེན་འཐབ་ཆོག","གསང་ཨང་མཐུན་པོ།","གསང་ཨང་མི་མཐུན།","པར་རིས་གཅད་པ།","གཡོག་ནས་སྤོར · སྐྱེལ་ནས་ཆེ་ཆུང་བཟོ།"],
  ca: ["Inicia la sessió","Correu","Contrasenya","Inicia la sessió","Correu o contrasenya no vàlids.","Crea el teu perfil","Correu","Contrasenya","Confirma la contrasenya","Sobrenom","Foto de perfil","Crea un compte","Opcional","Afegeix una foto","El teu nom a mostrar","you@example.com","••••••••","••••••••","Comprovant…","Aquest sobrenom ja s'utilitza.","Aquest sobrenom està disponible.","Introdueix un correu vàlid.","Aquest correu ja està registrat.","Aquest correu està disponible.","Les contrasenyes coincideixen.","Les contrasenyes no coincideixen.","Retalla la foto","Arrastra per moure · Scroll per zoom"],
  cs: ["Přihlásit","E-mail","Heslo","Přihlásit","Neplatný e-mail nebo heslo.","Vytvořte si profil","E-mail","Heslo","Potvrďte heslo","Přezdívka","Profilová fotka","Vytvořit účet","Volitelné","Přidat foto","Vaše zobrazované jméno","you@example.com","••••••••","••••••••","Kontroluji…","Tato přezdívka je již používána.","Tato přezdívka je k dispozici.","Zadejte platný e-mail.","Tento e-mail je již registrován.","Tento e-mail je k dispozici.","Hesla se shodují.","Hesla se neshodují.","Oříznout foto","Přetáhněte pro posun · Scroll pro zoom"],
  da: ["Log ind","E-mail","Adgangskode","Log ind","Ugyldig e-mail eller adgangskode.","Opret din profil","E-mail","Adgangskode","Bekræft adgangskode","Kaldenavn","Profilbillede","Opret konto","Valgfri","Tilføj billede","Dit visningsnavn","you@example.com","••••••••","••••••••","Tjekker…","Dette kaldenavn er allerede i brug.","Dette kaldenavn er tilgængeligt.","Indtast en gyldig e-mail.","Denne e-mail er allerede registreret.","Denne e-mail er tilgængeligt.","Adgangskoderne matcher.","Adgangskoderne matcher ikke.","Beskær billede","Træk for at flytte · Scroll for zoom"],
  el: ["Σύνδεση","Email","Κωδικός","Σύνδεση","Μη έγκυρο email ή κωδικός.","Δημιουργήστε το προφίλ σας","Email","Κωδικός","Επιβεβαίωση κωδικού","Ψευδώνυμο","Φωτογραφία προφίλ","Δημιουργία λογαριασμού","Προαιρετικό","Προσθήκη φωτογραφίας","Το όνομα εμφάνισής σας","you@example.com","••••••••","••••••••","Έλεγχος…","Αυτό το ψευδώνυμο χρησιμοποιείται ήδη.","Αυτό το ψευδώνυμο είναι διαθέσιμο.","Εισάγετε έγκυρο email.","Αυτό το email είναι ήδη εγγεγραμμένο.","Αυτό το email είναι διαθέσιμο.","Οι κωδικοί ταιριάζουν.","Οι κωδικοί δεν ταιριάζουν.","Περικοπή φωτογραφίας","Σύρετε για μετακίνηση · Κύλιση για ζουμ"],
  et: ["Logi sisse","E-post","Parool","Logi sisse","Vale e-post või parool.","Loo oma profil","E-post","Parool","Kinnita parool","Hüüdnimi","Profilifoto","Loo konto","Valikuline","Lisa foto","Sinu kuvatav nimi","you@example.com","••••••••","••••••••","Kontrollin…","See hüüdnimi on juba kasutusel.","See hüüdnimi on saadaval.","Sisesta kehtiv e-post.","See e-post on juba registreeritud.","See e-post on saadaval.","Paroolid kattuvad.","Paroolid ei kattu.","Lõika fotot","Lohista liigutamiseks · Keri suumimiseks"],
  fa: ["ورود","ایمیل","رمز عبور","ورود","ایمیل یا رمز عبور نامعتبر.","پروفایل خود را بسازید","ایمیل","رمز عبور","تأیید رمز عبور","نام مستعار","عکس پروفایل","ایجاد حساب","اختیاری","افزودن عکس","نام نمایشی شما","you@example.com","••••••••","••••••••","در حال بررسی…","این نام مستعار قبلاً استفاده شده.","این نام مستعار موجود است.","یک ایمیل معتبر وارد کنید.","این ایمیل قبلاً ثبت شده.","این ایمیل موجود است.","رمزها یکسان هستند.","رمزها یکسان نیستند.","برش عکس","بکشید برای جابه‌جایی · اسکرول برای زوم"],
  fi: ["Kirjaudu","Sähköposti","Salasana","Kirjaudu","Virheellinen sähköposti tai salasana.","Luo profiilisi","Sähköposti","Salasana","Vahvista salasana","Nimimerkki","Profilikuva","Luo tili","Valinnainen","Lisää kuva","Näyttönimesi","you@example.com","••••••••","••••••••","Tarkistetaan…","Tämä nimimerkki on jo käytössä.","Tämä nimimerkki on vapaana.","Syötä voimassa oleva sähköposti.","Tämä sähköposti on jo rekisteröity.","Tämä sähköposti on vapaana.","Salasanat täsmäävät.","Salasanat eivät täsmää.","Rajaa kuvaa","Vedä siirrettäessä · Vieritä zoomatessa"],
  fil: ["Mag-log in","Email","Password","Mag-log in","Hindi wastong email o password.","Lumikha ng iyong profile","Email","Password","Kumpirmahin ang password","Palayaw","Larawan sa profile","Lumikha ng account","Opsiyonal","Magdagdag ng larawan","Iyong pangalang ipapakita","you@example.com","••••••••","••••••••","Sinusuri…","Ang palayaw na ito ay ginagamit na.","Ang palayaw na ito ay available.","Maglagay ng wastong email.","Ang email na ito ay naka-rehistro na.","Ang email na ito ay available.","Magkatugma ang mga password.","Hindi magkatugma ang mga password.","I-crop ang larawan","I-drag para ilipat · I-scroll para mag-zoom"],
  gu: ["લોગ ઇન","ઈમેલ","પાસવર્ડ","લોગ ઇન","અમાન્ય ઈમેલ અથવા પાસવર્ડ.","તમારી પ્રોફાઇલ બનાવો","ઈમેલ","પાસવર્ડ","પાસવર્ડ ખાતરી કરો","ઉપનામ","પ્રોફાઇલ ફોટો","એકાઉન્ટ બનાવો","વૈકલ્પિક","ફોટો ઉમેરો","તમારું પ્રદર્શન નામ","you@example.com","••••••••","••••••••","ચેક કરી રહ્યા છીએ…","આ ઉપનામ પહેલેથી વપરાય છે.","આ ઉપનામ ઉપલબ્ધ છે.","માન્ય ઈમેલ દાખલ કરો.","આ ઈમેલ પહેલેથી નોંધાયેલ છે.","આ ઈમેલ ઉપલબ્ધ છે.","પાસવર્ડ મેળ ખાય છે.","પાસવર્ડ મેળ ખાતા નથી.","ફોટો ક્રોપ કરો","ખસેડવા ખેંચો · ઝૂમ સ્ક્રોલ કરો"],
  hr: ["Prijava","E-mail","Lozinka","Prijava","Neispravan e-mail ili lozinka.","Stvorite svoj profil","E-mail","Lozinka","Potvrdi lozinku","Nadimak","Profilna slika","Stvori račun","Opcionalno","Dodaj fotografiju","Vaše ime za prikaz","you@example.com","••••••••","••••••••","Provjeravam…","Ovaj nadimak je već u uporabi.","Ovaj nadimak je dostupan.","Unesite ispravan e-mail.","Ovaj e-mail je već registriran.","Ovaj e-mail je dostupan.","Lozinke se podudaraju.","Lozinke se ne podudaraju.","Obreži fotografiju","Povucite za pomicanje · Scroll za zum"],
  hu: ["Bejelentkezés","E-mail","Jelszó","Bejelentkezés","Érvénytelen e-mail vagy jelszó.","Profil létrehozása","E-mail","Jelszó","Jelszó megerősítése","Becenév","Profilkép","Fiók létrehozása","Opcionális","Fénykép hozzáadása","Megjelenített neved","you@example.com","••••••••","••••••••","Ellenőrzés…","Ez a becenév már használatban van.","Ez a becenév elérhető.","Adj meg érvényes e-mailt.","Ez az e-mail már regisztrált.","Ez az e-mail elérhető.","A jelszavak egyeznek.","A jelszavak nem egyeznek.","Fénykép vágása","Húzd a mozgatáshoz · Görgess a zoomhoz"],
  hy: ["Մուտք","Էլ․ փոստ","Գաղտնաբառ","Մուտք","Սխալ էլ․ փոստ կամ գաղտնաբառ։","Ստեղծեք ձեր պրոֆիլը","Էլ․ փոստ","Գաղտնաբառ","Հաստատել գաղտնաբառը","Մականուն","Պրոֆիլի նկար","Հաշիվ ստեղծել","Ընտրովի","Ավելացնել նկար","Ձեր ցուցադրվող անունը","you@example.com","••••••••","••••••••","Ստուգվում է…","Այս մականունն արդեն օգտագործվում է։","Այս մականունը հասանելի է։","Մուտքագրեք վավեր էլ․ փոստ։","Այս էլ․ փոստն արդեն գրանցված է։","Այս էլ․ փոստը հասանելի է։","Գաղտնաբառերը համընկնում են։","Գաղտնաբառերը չեն համընկնում։","Կտրել նկարը","Քաշեք տեղափոխելու · Ոլորեք մեծացնելու համար"],
  ka: ["შესვლა","ფოსტა","პაროლი","შესვლა","არასწორი ფოსტა ან პაროლი.","შექმენით პროფილი","ფოსტა","პაროლი","დაადასტურეთ პაროლი","მეტსახელი","პროფილის ფოტო","ანგარიშის შექმნა","არჩევითი","ფოტოს დამატება","თქვენი საჩვენებელი სახელი","you@example.com","••••••••","••••••••","შემოწმება…","ეს მეტსახელი უკვე გამოყენებულია.","ეს მეტსახელი ხელმისაწვდომია.","შეიყვანეთ სწორი ფოსტა.","ეს ფოსტა უკვე რეგისტრირებულია.","ეს ფოსტა ხელმისაწვდომია.","პაროლები ემთხვევა.","პაროლები არ ემთხვევა.","ფოტოს ამოჭრა","გადაადგილება გადაათრიეთ · ზუმი დაასკროლეთ"],
  kk: ["Кіру","Эл. пошта","Құпия сөз","Кіру","Пошта немесе құпия сөз дұрыс емес.","Профильді жасаңыз","Эл. пошта","Құпия сөз","Құпия сөзді растаңыз","Лақап аты","Профиль суреті","Аккаунт жасау","Қосымша","Сурет қосу","Көрсетілетін атыңыз","you@example.com","••••••••","••••••••","Тексерілуде…","Бұл лақап аты қолданыста.","Бұл лақап аты қолжетімді.","Жарамды пошта енгізіңіз.","Бұл пошта тіркелген.","Бұл пошта қолжетімді.","Құпия сөздер сәйкес.","Құпия сөздер сәйкес емес.","Суретті кесу","Жылжыту үшін сүйреңіз · Зум үшін айналдырыңыз"],
  km: ["ចូល","អ៉ីមែល","ពាក្យសម្ងាត់","ចូល","អ៉ីមែល ឬ ពាក្យសម្ងាត់ មិនត្រឹមត្រូវ។","បង្កើតប្រវត្តិរូបរបស់អ្នក","អ៉ីមែល","ពាក្យសម្ងាត់","បញ្ជាក់ពាក្យសម្ងាត់","ឈ្មោះហៅ","រូបប្រវត្តិរូប","បង្កើតគណនី","ជម្រើស","បន្ថែមរូប","ឈ្មោះបង្ហាញរបស់អ្នក","you@example.com","••••••••","••••••••","កំពុងពិនិត្យ…","ឈ្មោះហៅនេះត្រូវបានប្រើរួច។","ឈ្មោះហៅនេះអាចប្រើបាន។","បញ្ចូលអ៉ីមែលដែលត្រឹមត្រូវ។","អ៉ីមែលនេះបានចុះឈ្មោះរួច។","អ៉ីមែលនេះអាចប្រើបាន។","ពាក្យសម្ងាត់ដូចគ្នា។","ពាក្យសម្ងាត់មិនដូចគ្នា។","កាត់រូប","អូសដើម្បីផ្លាស់ · រមៀលដើម្បីពង្រីក"],
  kn: ["ಲಾಗ್ ಇನ್","ಇಮೇಲ್","ಪಾಸ್‌ವರ್ಡ್","ಲಾಗ್ ಇನ್","ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.","ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ","ಇಮೇಲ್","ಪಾಸ್‌ವರ್ಡ್","ಪಾಸ್‌ವರ್ಡ್ ಖಾತರಿ ಮಾಡಿ","ಉಪನಾಮ","ಪ್ರೊಫೈಲ್ ಫೋಟೋ","ಖಾತೆ ರಚಿಸಿ","ಐಚ್ಛಿಕ","ಫೋಟೋ ಸೇರಿಸಿ","ನಿಮ್ಮ ಪ್ರದರ್ಶನ ಹೆಸರು","you@example.com","••••••••","••••••••","ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…","ಈ ಉಪನಾಮ ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ.","ಈ ಉಪನಾಮ ಲಭ್ಯವಿದೆ.","ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ.","ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ.","ಈ ಇಮೇಲ್ ಲಭ್ಯವಿದೆ.","ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ.","ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.","ಫೋಟೋ ಕ್ರಾಪ್ ಮಾಡಿ","ಸರಿಸಲು ಎಳೆಯಿರಿ · ಜೂಮ್ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ"],
  ky: ["Кирүү","Эл. почта","Сыр сөз","Кирүү","Почта же сыр сөз туура эмес.","Профилиңизди түзүңүз","Эл. почта","Сыр сөз","Сыр сөздү ырастаңыз","Такмак аты","Профиль сүрөтү","Аккаунт түзүү","Кошумча","Сүрөт кошуу","Көрсөтүлүүчү атыңыз","you@example.com","••••••••","••••••••","Текшерилуүдө…","Бул такмак аты колдонулууда.","Бул такмак аты жеткиликтүү.","Жарактуу почта киргизиңиз.","Бул почта катталган.","Бул почта жеткиликтүү.","Сыр сөздөр дал келет.","Сыр сөздөр дал келбейт.","Сүрөттү кесүү","Жылдыруу үчүн сүйрөңүз · Зум үчүн scroll"],
  lo: ["ເຂົ້າສູ່ລະບົບ","ອີເມວ","ລະຫັດຜ່ານ","ເຂົ້າສູ່ລະບົບ","ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ","ສ້າງໂປຣໄຟລ໌ຂອງທ່ານ","ອີເມວ","ລະຫັດຜ່ານ","ຢືນຢັນລະຫັດຜ່ານ","ຊື່ຫຼິ້ນ","ຮູບໂປຣໄຟລ໌","ສ້າງບັນຊີ","ທາງເລືອກ","ເພີ່ມຮູບ","ຊື່ສະແດງຂອງທ່ານ","you@example.com","••••••••","••••••••","ກຳລັງກວດສອບ…","ຊື່ຫຼິ້ນນີ້ຖືກໃຊ້ແລ້ວ","ຊື່ຫຼິ້ນນີ້ພ້ອມໃຊ້","ໃສ່ອີເມວທີ່ຖືກຕ້ອງ","ອີເມວນີ້ລົງທະບຽນແລ້ວ","ອີເມວນີ້ພ້ອມໃຊ້","ລະຫັດຜ່ານກົງກັນ","ລະຫັດຜ່ານບໍ່ກົງກັນ","ຕັດຮູບ","ລາກເພື່ອຍ້າຍ · ເລື່ອນເພື່ອຊູມ"],
  lt: ["Prisijungti","El. paštas","Slaptažodis","Prisijungti","Neteisingas el. paštas arba slaptažodis.","Sukurkite savo profilį","El. paštas","Slaptažodis","Patvirtinti slaptažodį","Slapyvardis","Profilio nuotrauka","Sukurti paskyrą","Neprivaloma","Pridėti nuotrauką","Jūsų rodomas vardas","you@example.com","••••••••","••••••••","Tikrinama…","Šis slapyvardis jau naudojamas.","Šis slapyvardis galimas.","Įveskite tinkamą el. paštą.","Šis el. paštas jau užregistruotas.","Šis el. paštas galimas.","Slaptažodžiai sutampa.","Slaptažodžiai nesutampa.","Apkarpyti nuotrauką","Vilkite norint perkelti · Slinkite norint priartinti"],
  lv: ["Pieslēgties","E-pasts","Parole","Pieslēgties","Nederīga e-pasta adrese vai parole.","Izveidojiet savu profilu","E-pasts","Parole","Apstiprināt paroli","Segvārds","Profilbildē","Izveidot kontu","Neobligāti","Pievienot fotogrāfiju","Jūsu parādāmais vārds","you@example.com","••••••••","••••••••","Pārbauda…","Šis segvārds jau tiek izmantots.","Šis segvārds ir pieejams.","Ievadiet derīgu e-pastu.","Šis e-pasts jau ir reģistrēts.","Šis e-pasts ir pieejams.","Paroles sakrīt.","Paroles nesakrīt.","Apgriezt fotogrāfiju","Vilkt, lai pārvietotu · Ritināt, lai tālummaiņu"],
  mk: ["Најава","Е-пошта","Лозинка","Најава","Неважечка е-пошта или лозинка.","Направете го вашиот профил","Е-пошта","Лозинка","Потврди лозинка","Надимак","Профилна слика","Креирај сметка","Опционално","Додај слика","Вашето име за приказ","you@example.com","••••••••","••••••••","Проверка…","Овој надимак е веќе во употреба.","Овој надимак е достапен.","Внесете валидна е-пошта.","Оваа е-пошта е веќе регистрирана.","Оваа е-пошта е достапна.","Лозинките се совпаѓаат.","Лозинките не се совпаѓаат.","Исечи слика","Влечи за поместување · Лизгај за зумирање"],
  ml: ["ലോഗിൻ","ഇമെയിൽ","പാസ്‌വേഡ്","ലോഗിൻ","അസാധുവായ ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ്.","നിങ്ങളുടെ പ്രൊഫൈൽ സൃഷ്ടിക്കുക","ഇമെയിൽ","പാസ്‌വേഡ്","പാസ്‌വേഡ് ഉറപ്പാക്കുക","വിളിപ്പേര്","പ്രൊഫൈൽ ഫോട്ടോ","അക്കൗണ്ട് സൃഷ്ടിക്കുക","ഓപ്ഷണൽ","ഫോട്ടോ ചേർക്കുക","നിങ്ങളുടെ പ്രദർശന നാമം","you@example.com","••••••••","••••••••","പരിശോധിക്കുന്നു…","ഈ വിളിപ്പേര് ഇതിനകം ഉപയോഗത്തിലാണ്.","ഈ വിളിപ്പേര് ലഭ്യമാണ്.","സാധുവായ ഇമെയിൽ നൽകുക.","ഈ ഇമെയിൽ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.","ഈ ഇമെയിൽ ലഭ്യമാണ്.","പാസ്‌വേഡുകൾ യോജിക്കുന്നു.","പാസ്‌വേഡുകൾ യോജിക്കുന്നില്ല.","ഫോട്ടോ ക്രോപ്പ് ചെയ്യുക","നീക്കാൻ വലിക്കുക · സൂം ചെയ്യാൻ സ്ക്രോൾ ചെയ്യുക"],
  mn: ["Нэвтрэх","Имэйл","Нууц үг","Нэвтрэх","Буруу имэйл эсвэл нууц үг.","Профайлаа үүсгэ","Имэйл","Нууц үг","Нууц үгээ баталгаажуул","Хоч нэр","Профайл зураг","Бүртгэл үүсгэх","Заавал биш","Зураг нэмэх","Таны харагдах нэр","you@example.com","••••••••","••••••••","Шалгаж байна…","Энэ хоч нэр аль хэдийн ашиглагдсан.","Энэ хоч нэр боломжтой.","Зөв имэйл оруулна уу.","Энэ имэйл аль хэдийн бүртгэгдсэн.","Энэ имэйл боломжтой.","Нууц үгнүүд таарч байна.","Нууц үгнүүд таарахгүй байна.","Зураг хайчлах","Зөөхийг чир · Zoom дээр гүйлгэ"],
  mr: ["लॉग इन","ईमेल","पासवर्ड","लॉग इन","अवैध ईमेल किंवा पासवर्ड.","तुमचे प्रोफाइल तयार करा","ईमेल","पासवर्ड","पासवर्डाची पुष्टी करा","टोपणनाव","प्रोफाइल फोटो","खाते तयार करा","पर्यायी","फोटो जोडा","तुमचे प्रदर्शन नाव","you@example.com","••••••••","••••••••","तपासत आहे…","हे टोपणनाव आधीच वापरात आहे.","हे टोपणनाव उपलब्ध आहे.","वैध ईमेल प्रविष्ट करा.","हे ईमेल आधीच नोंदणीकृत आहे.","हे ईमेल उपलब्ध आहे.","पासवर्ड जुळतात.","पासवर्ड जुळत नाहीत.","फोटो क्रॉप करा","हलवण्यासाठी ड्रॅग करा · झूम साठी स्क्रोल करा"],
  ms: ["Log masuk","E-mel","Kata laluan","Log masuk","E-mel atau kata laluan tidak sah.","Cipta profil anda","E-mel","Kata laluan","Sahkan kata laluan","Nama panggilan","Foto profil","Cipta akaun","Pilihan","Tambah foto","Nama paparan anda","you@example.com","••••••••","••••••••","Memeriksa…","Nama panggilan ini sudah digunakan.","Nama panggilan ini tersedia.","Masukkan e-mel yang sah.","E-mel ini sudah berdaftar.","E-mel ini tersedia.","Kata laluan sepadan.","Kata laluan tidak sepadan.","Potong foto","Seret untuk alih · Skrol untuk zum"],
  my: ["ဝင်ရောက်မည်","အီးမေးလ်","စကားဝှက်","ဝင်ရောက်မည်","အီးမေးလ် သို့မဟုတ် စကားဝှက် မမှန်ကန်ပါ။","သင့်ပရိုဖိုင်းဖန်တီးပါ","အီးမေးလ်","စကားဝှက်","စကားဝှက်အတည်ပြုပါ","ကြွေးကြော်အမည်","ပရိုဖိုင်းဓာတ်ပုံ","အကောင့်ဖန်တီးပါ","ရွေးချယ်မှု","ဓာတ်ပုံထည့်ပါ","သင့်ပြသသည့်အမည်","you@example.com","••••••••","••••••••","စစ်ဆေးနေသည်…","ဤကြွေးကြော်အမည်ကို အသုံးပြုပြီးသားဖြစ်သည်။","ဤကြွေးကြော်အမည် ရရှိနိုင်သည်။","မှန်ကန်သောအီးမေးလ် ထည့်ပါ။","ဤအီးမေးလ်ကို မှတ်ပုံတင်ပြီးသားဖြစ်သည်။","ဤအီးမေးလ် ရရှိနိုင်သည်။","စကားဝှက်များ ကိုက်ညီသည်။","စကားဝှက်များ မကိုက်ညီပါ။","ဓာတ်ပုံဖြတ်ပါ","ရွှေ့ရန် ဆွဲပါ · ချဲ့ရန် လှိမ့်ပါ"],
  ne: ["लग इन गर्नुहोस्","इमेल","पासवर्ड","लग इन गर्नुहोस्","अवैध इमेल वा पासवर्ड।","आफ्नो प्रोफाइल बनाउनुहोस्","इमेल","पासवर्ड","पासवर्ड पुष्टि गर्नुहोस्","उपनाम","प्रोफाइल फोटो","खाता बनाउनुहोस्","वैकल्पिक","फोटो थप्नुहोस्","तपाईंको प्रदर्शन नाम","you@example.com","••••••••","••••••••","जाँच गर्दैछ…","यो उपनाम पहिले नै प्रयोगमा छ।","यो उपनाम उपलब्ध छ।","वैध इमेल प्रविष्ट गर्नुहोस्।","यो इमेल पहिले नै दर्ता गरिएको छ।","यो इमेल उपलब्ध छ।","पासवर्डहरू मिल्छन्।","पासवर्डहरू मिल्दैनन्।","फोटो क्रप गर्नुहोस्","सार्न तान्नुहोस् · जुम गर्न स्क्रोल गर्नुहोस्"],
  no: ["Logg inn","E-post","Passord","Logg inn","Ugyldig e-post eller passord.","Opprett profilen din","E-post","Passord","Bekreft passord","Kallenavn","Profilbilde","Opprett konto","Valgfritt","Legg til bilde","Ditt visningsnavn","you@example.com","••••••••","••••••••","Sjekker…","Dette kallenavnet er allerede i bruk.","Dette kallenavnet er tilgjengelig.","Skriv inn en gyldig e-post.","Denne e-posten er allerede registrert.","Denne e-posten er tilgjengelig.","Passordene stemmer.","Passordene stemmer ikke.","Beskjær bilde","Dra for å flytte · Rull for zoom"],
  or: ["ଲଗ ଇନ୍ କରନ୍ତୁ","ଇମେଲ୍","ପାସୱାର୍ଡ","ଲଗ ଇନ୍ କରନ୍ତୁ","ଅବୈଧ ଇମେଲ୍ କିମ୍ବା ପାସୱାର୍ଡ୍।","ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ସୃଷ୍ଟି କରନ୍ତୁ","ଇମେଲ୍","ପାସୱାର୍ଡ","ପାସୱାର୍ଡ୍ ନିଶ୍ଚିତ କରନ୍ତୁ","ଉପନାମ","ପ୍ରୋଫାଇଲ୍ ଫଟୋ","ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ","ବିକଳ୍ପ","ଫଟୋ ଯୋଡ଼ନ୍ତୁ","ଆପଣଙ୍କ ପ୍ରଦର୍ଶନ ନାମ","you@example.com","••••••••","••••••••","ଯାଞ୍ଚ କରୁଛି…","ଏହି ଉପନାମ ପୂର୍ବରୁ ବ୍ୟବହୃତ।","ଏହି ଉପନାମ ଉପଲବ୍ଧ।","ବୈଧ ଇମେଲ୍ ପ୍ରବେଶ କରନ୍ତୁ।","ଏହି ଇମେଲ୍ ପୂର୍ବରୁ ନିବେଦିତ।","ଏହି ଇମେଲ୍ ଉପଲବ୍ଧ।","ପାସୱାର୍ଡ୍ ମିଳୁଛି।","ପାସୱାର୍ଡ୍ ମିଳୁନାହିଁ।","ଫଟୋ କ୍ରପ୍ କରନ୍ତୁ","ସ୍ଥାନାନ୍ତର କରିବା ପାଇଁ ଟାଣନ୍ତୁ · ଜୁମ୍ ପାଇଁ ସ୍କ୍ରୋଲ୍ କରନ୍ତୁ"],
  pa: ["ਲੌਗ ਇਨ","ਈਮੇਲ","ਪਾਸਵਰਡ","ਲੌਗ ਇਨ","ਗਲਤ ਈਮੇਲ ਜਾਂ ਪਾਸਵਰਡ।","ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ","ਈਮੇਲ","ਪਾਸਵਰਡ","ਪਾਸਵਰਡ ਪੁਸ਼ਟੀ ਕਰੋ","ਉਪਨਾਮ","ਪ੍ਰੋਫਾਈਲ ਫੋਟੋ","ਖਾਤਾ ਬਣਾਓ","ਵਿਕਲਪਿਕ","ਫੋਟੋ ਜੋੜੋ","ਤੁਹਾਡਾ ਪ੍ਰਦਰਸ਼ਨ ਨਾਮ","you@example.com","••••••••","••••••••","ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ…","ਇਹ ਉਪਨਾਮ ਪਹਿਲਾਂ ਵਰਤਿਆ ਜਾ ਚੁੱਕਾ ਹੈ।","ਇਹ ਉਪਨਾਮ ਉਪਲਬਧ ਹੈ।","ਵੈਧ ਈਮੇਲ ਦਾਖਲ ਕਰੋ।","ਇਹ ਈਮੇਲ ਪਹਿਲਾਂ ਰਜਿਸਟਰ ਹੈ।","ਇਹ ਈਮੇਲ ਉਪਲਬਧ ਹੈ।","ਪਾਸਵਰਡ ਮੇਲ ਖਾਂਦੇ ਹਨ।","ਪਾਸਵਰਡ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ।","ਫੋਟੋ ਕ੍ਰੌਪ ਕਰੋ","ਖਿਸਕਾਉਣ ਲਈ ਖਿੱਚੋ · ਜ਼ੂਮ ਲਈ ਸਕ੍ਰੌਲ ਕਰੋ"],
  ro: ["Autentificare","E-mail","Parolă","Autentificare","E-mail sau parolă invalidă.","Creează-ți profilul","E-mail","Parolă","Confirmă parola","Poreclă","Foto profil","Creează cont","Opțional","Adaugă poză","Numele tău afișat","you@example.com","••••••••","••••••••","Se verifică…","Această poreclă e deja folosită.","Această poreclă e disponibilă.","Introdu un e-mail valid.","Acest e-mail e deja înregistrat.","Acest e-mail e disponibil.","Parolele coincid.","Parolele nu coincid.","Decupează foto","Trage pentru a muta · Derulează pentru zoom"],
  si: ["පිවිසෙන්න","ඊමේල්","මුරපදය","පිවිසෙන්න","වලංගු නොවන ඊමේල් හෝ මුරපදය.","ඔබේ පැතිකඩ සාදන්න","ඊමේල්","මුරපදය","මුරපදය තහවුරු කරන්න","අන්වර්ථ නාමය","පැතිකඩ ඡායාරූපය","ගිණුම සාදන්න","විකල්ප","ඡායාරූපය එක් කරන්න","ඔබේ පෙන්වුම් නාමය","you@example.com","••••••••","••••••••","පරීක්ෂා කරමින්…","මෙම අන්වර්ථ නාමය දැනටමත් භාවිතයේ ය.","මෙම අන්වර්ථ නාමය ලබා ගත හැක.","වලංගු ඊමේල් ලිපිනය ඇතුළත් කරන්න.","මෙම ඊමේල් දැනටමත් ලියාපදිංචි වී ඇත.","මෙම ඊමේල් ලබා ගත හැක.","මුරපද ගැලපේ.","මුරපද ගැලපෙන්නේ නැත.","ඡායාරූපය කපන්න","චලනය කිරීමට ඇද්දන්න · විශාලනයට අනුචලනය කරන්න"],
  sk: ["Prihlásiť sa","E-mail","Heslo","Prihlásiť sa","Neplatný e-mail alebo heslo.","Vytvorte si profil","E-mail","Heslo","Potvrďte heslo","Prezývka","Profilová fotka","Vytvoriť účet","Voliteľné","Pridať fotku","Vaše zobrazované meno","you@example.com","••••••••","••••••••","Kontrolujem…","Táto prezývka sa už používa.","Táto prezývka je k dispozícii.","Zadajte platný e-mail.","Tento e-mail je už registrovaný.","Tento e-mail je k dispozícii.","Heslá sa zhodujú.","Heslá sa nezhodujú.","Orezať fotku","Presuňte pre posun · Scroll pre zoom"],
  sl: ["Prijava","E-pošta","Geslo","Prijava","Neveljaven e-poštni naslov ali geslo.","Ustvarite svoj profil","E-pošta","Geslo","Potrdite geslo","Vzdevek","Profilna slika","Ustvari račun","Izbirno","Dodaj fotografijo","Vaše prikazno ime","you@example.com","••••••••","••••••••","Preverjam…","Ta vzdevek je že v uporabi.","Ta vzdevek je na voljo.","Vnesite veljaven e-poštni naslov.","Ta e-pošta je že registrirana.","Ta e-pošta je na voljo.","Gesli se ujemata.","Gesli se ne ujemata.","Obreži fotografijo","Povleci za premik · Drsenje za zoom"],
  sq: ["Hyr","Email","Fjalëkalimi","Hyr","Email ose fjalëkalim i pavlefshëm.","Krijo profilin tënd","Email","Fjalëkalimi","Konfirmo fjalëkalimin","Pseudonim","Foto e profilit","Krijo llogari","Opsional","Shto foto","Emri juaj i shfaqur","you@example.com","••••••••","••••••••","Duke kontrolluar…","Ky pseudonim është në përdorim.","Ky pseudonim është i disponueshëm.","Vendosni një email të vlefshëm.","Ky email është i regjistruar.","Ky email është i disponueshëm.","Fjalëkalimet përputhen.","Fjalëkalimet nuk përputhen.","Pritini foton","Tërhiqni për të lëvizur · Rrëshqitni për zoom"],
  sr: ["Пријава","Е-пошта","Лозинка","Пријава","Неисправна е-пошта или лозинка.","Направите свој профил","Е-пошта","Лозинка","Потврдите лозинку","Надимак","Профилна слика","Направи налог","Опционо","Додај фотографију","Ваше име за приказ","you@example.com","••••••••","••••••••","Провера…","Овај надимак је већ у употреби.","Овај надимак је доступан.","Унесите исправну е-пошту.","Ова е-пошта је већ регистрована.","Ова е-пошта је доступна.","Лозинке се подударају.","Лозинке се не подударају.","Исеци фотографију","Повуци за померање · Скрол за зум"],
  sv: ["Logga in","E-post","Lösenord","Logga in","Ogiltig e-post eller lösenord.","Skapa din profil","E-post","Lösenord","Bekräfta lösenord","Smeknamn","Profilbild","Skapa konto","Valfritt","Lägg till foto","Ditt visningsnamn","you@example.com","••••••••","••••••••","Kontrollerar…","Detta smeknamn används redan.","Detta smeknamn är tillgängligt.","Ange en giltig e-postadress.","Denna e-post är redan registrerad.","Denna e-post är tillgänglig.","Lösenorden matchar.","Lösenorden matchar inte.","Beskär foto","Dra för att flytta · Scrolla för zoom"],
  sw: ["Ingia","Barua pepe","Nenosiri","Ingia","Barua pepe au nenosiri batili.","Unda wasifu wako","Barua pepe","Nenosiri","Thibitisha nenosiri","Jina la utani","Picha ya wasifu","Fungua akaunti","Si lazima","Ongeza picha","Jina lako la kuonyesha","you@example.com","••••••••","••••••••","Inakagua…","Jina hili la utani tayari linatumika.","Jina hili la utani linapatikana.","Weka barua pepe halali.","Barua pepe hii imeshasajiliwa.","Barua pepe hii inapatikana.","Nenosiri linalingana.","Nenosiri halilingani.","Kata picha","Buruta kusogeza · Sogeza kukuza"],
  ta: ["உள்நுழை","மின்னஞ்சல்","கடவுச்சொல்","உள்நுழை","தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.","உங்கள் சுயவிவரத்தை உருவாக்குங்கள்","மின்னஞ்சல்","கடவுச்சொல்","கடவுச்சொல்லை உறுதிசெய்","புனைபெயர்","சுயவிவர படம்","கணக்கு உருவாக்கு","விரும்பினால்","படம் சேர்","உங்கள் காட்சிப் பெயர்","you@example.com","••••••••","••••••••","சரிபார்க்கிறது…","இந்த புனைபெயர் ஏற்கனவே பயன்பாட்டில் உள்ளது.","இந்த புனைபெயர் கிடைக்கிறது.","செல்லுபடியான மின்னஞ்சலை உள்ளிடவும்.","இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.","இந்த மின்னஞ்சல் கிடைக்கிறது.","கடவுச்சொற்கள் பொருந்துகின்றன.","கடவுச்சொற்கள் பொருந்தவில்லை.","படத்தை வெட்டு","நகர்த்த இழுக்கவும் · பெரிதாக்க ஸ்க்ரோல் செய்யவும்"],
  te: ["లాగిన్","ఇమెయిల్","పాస్‌వర్డ్","లాగిన్","చెల్లని ఇమెయిల్ లేదా పాస్‌వర్డ్.","మీ ప్రొఫైల్‌ను సృష్టించండి","ఇమెయిల్","పాస్‌వర్డ్","పాస్‌వర్డ్ నిర్ధారించండి","మారుపేరు","ప్రొఫైల్ ఫోటో","ఖాతా సృష్టించండి","ఐచ్ఛికం","ఫోటో జోడించండి","మీ ప్రదర్శన పేరు","you@example.com","••••••••","••••••••","తనిఖీ చేస్తోంది…","ఈ మారుపేరు ఇప్పటికే వాడుకలో ఉంది.","ఈ మారుపేరు అందుబాటులో ఉంది.","చెల్లుబాటు అయ్యే ఇమెయిల్ నమోదు చేయండి.","ఈ ఇమెయిల్ ఇప్పటికే నమోదు చేయబడింది.","ఈ ఇమెయిల్ అందుబాటులో ఉంది.","పాస్‌వర్డ్‌లు సరిపోతాయి.","పాస్‌వర్డ్‌లు సరిపోవు.","ఫోటో క్రాప్ చేయండి","కదిలించడానికి లాగండి · జూమ్ చేయడానికి స్క్రోల్ చేయండి"],
  tg: ["Ворид шудан","Почтаи электронӣ","Рамз","Ворид шудан","Почта ё рамз нодуруст.","Профили худро созед","Почтаи электронӣ","Рамз","Рамзро тасдиқ кунед","Лақаб","Акси профил","Ҳисоб эҷод кунед","Ихтиёрӣ","Акс илова кунед","Номи намоиши шумо","you@example.com","••••••••","••••••••","Санҷиш…","Ин лақаб аллакай истифода мешавад.","Ин лақаб дастрас аст.","Почтаи дуруст ворид кунед.","Ин почта аллакай ба қайд гирифта шудааст.","Ин почта дастрас аст.","Рамзҳо мувофиқанд.","Рамзҳо мувофиқ нестанд.","Аксро буред","Барои кӯчонидан кашед · Барои зум айландиред"],
  tl: ["Mag-log in","Email","Password","Mag-log in","Hindi wastong email o password.","Lumikha ng iyong profile","Email","Password","Kumpirmahin ang password","Palayaw","Larawan sa profile","Lumikha ng account","Opsiyonal","Magdagdag ng larawan","Iyong pangalang ipapakita","you@example.com","••••••••","••••••••","Sinusuri…","Ang palayaw na ito ay ginagamit na.","Ang palayaw na ito ay available.","Maglagay ng wastong email.","Ang email na ito ay naka-rehistro na.","Ang email na ito ay available.","Magkatugma ang mga password.","Hindi magkatugma ang mga password.","I-crop ang larawan","I-drag para ilipat · I-scroll para mag-zoom"],
  ur: ["لاگ ان کریں","ای میل","پاس ورڈ","لاگ ان کریں","غلط ای میل یا پاس ورڈ۔","اپنا پروفائل بنائیں","ای میل","پاس ورڈ","پاس ورڈ کی تصدیق کریں","عرفی نام","پروفائل تصویر","اکاؤنٹ بنائیں","اختیاری","تصویر شامل کریں","آپ کا ظاہر ہونے والا نام","you@example.com","••••••••","••••••••","جانچ ہو رہی ہے…","یہ عرفی نام پہلے سے استعمال میں ہے۔","یہ عرفی نام دستیاب ہے۔","درست ای میل درج کریں۔","یہ ای میل پہلے سے رجسٹرڈ ہے۔","یہ ای میل دستیاب ہے۔","پاس ورڈ مماثل ہیں۔","پاس ورڈ مماثل نہیں ہیں۔","تصویر کاٹیں","منتقلی کے لیے گھسیٹیں · زوم کے لیے سکرول کریں"],
  uz: ["Tizimga kirish","Elektron pochta","Parol","Tizimga kirish","Noto‘g‘ri email yoki parol.","Profil yarating","Elektron pochta","Parol","Parolni tasdiqlang","Taxallus","Profil rasmi","Hisob yaratish","Ixtiyoriy","Rasm qo‘shish","Ko‘rinadigan ismingiz","you@example.com","••••••••","••••••••","Tekshirilmoqda…","Bu taxallus allaqachon ishlatilmoqda.","Bu taxallus mavjud.","To‘g‘ri email kiriting.","Bu email allaqachon ro‘yxatdan o‘tgan.","Bu email mavjud.","Parollar mos.","Parollar mos emas.","Rasmni kesish","Ko‘chirish uchun torting · Zoom uchun aylantiring"]
};

// All 73 locale codes from the project
const ALL_CODES = ["af","am","ar","as","az","bg","bn","bo","ca","cs","da","de","el","en","es","et","fa","fi","fil","fr","gu","he","hi","hr","hu","hy","id","it","ja","ka","kk","km","kn","ko","ky","lo","lt","lv","mk","ml","mn","mr","ms","my","ne","nl","no","or","pa","pl","pt","pt-BR","ro","ru","si","sk","sl","sq","sr","sv","sw","ta","te","tg","th","tl","tr","uk","ur","uz","vi","zh","zh-TW"];

const out = {};
for (const code of ALL_CODES) {
  out[code] = build(LOCALES[code] || EN);
}
const outPath = path.join(__dirname, "signup-login-translations.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log("Wrote", outPath, "with", ALL_CODES.length, "locales. Translated:", Object.keys(LOCALES).length);
