export type UiLanguage = "ar" | "en" | "fr";

type Entry = readonly [string, string, string];

// Compatibility dictionary for UI text that still exists as literal text in
// older Phase 1/2/3 screens. It is deliberately UI-only: user/store data is
// never translated unless it exactly matches one of these fixed labels.
export const UI_TRANSLATIONS: Entry[] = [
  ["واجهة جريئة بطابع مجلّة أزياء مناسبة للعلامات المرئية.", "Bold editorial fashion interface for visual brands.", "Interface mode éditorial audacieuse pour les marques visuelles."],
  ["تخطيط عصري واضح مع بطاقات قوية وعناصر حركة خفيفة.", "Clear modern layout with strong cards and subtle motion.", "Mise en page moderne et claire avec des cartes fortes et des animations subtiles."],
  ["طابع تحريري فاخر مع مساحات واسعة وتفاصيل راقية.", "Luxury editorial feel with generous space and refined details.", "Style éditorial luxueux avec de grands espaces et des détails raffinés."],
  ["واجهة ناعمة ودافئة مصممة لمنتجات الجمال والعناية.", "Soft, warm interface designed for beauty and care products.", "Interface douce et chaleureuse conçue pour les produits de beauté et de soin."],
  ["واجهة نظيفة وهادئة تركز على المنتجات وسهولة الشراء.", "Clean, calm interface focused on products and easy shopping.", "Interface épurée et apaisée, centrée sur les produits et la simplicité d’achat."],
  ["التواصل مع فريق Nexora لتفعيل المتجر.", "Contact the Nexora team to activate the store.", "Contactez l’équipe Nexora pour activer la boutique."],
  ["تعديل بيانات المتجر العامة وإعدادات الشحن.", "Edit the store details and shipping settings.", "Modifier les informations de la boutique et les paramètres de livraison."],
  ["يرجى إرفاق إثبات الدفع.", "Please attach the payment proof.", "Veuillez joindre la preuve de paiement."],
  ["طريقة الدفع والتعليمات النهائية يقدمها فريق Nexora. يُرجى إكمال الدفع بالطريقة المتفق عليها ثم إرفاق الإثبات هنا. لن يتم تفعيل الاشتراك من المتصفح.", "The Nexora team provides the payment method and final instructions. Please complete the payment as agreed, then attach the proof here. The subscription will not be activated from the browser.", "L’équipe Nexora fournit le mode de paiement et les instructions finales. Veuillez effectuer le paiement comme convenu, puis joindre la preuve ici. L’abonnement ne sera pas activé depuis le navigateur."],
  ["هذا الرابط مستخدم من متجر آخر. اختر رابطًا مختلفًا.", "This URL is already used by another store. Choose a different URL.", "Cette URL est déjà utilisée par une autre boutique. Choisissez une autre URL."],
  ["هل تريد حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.", "Delete this image? This action cannot be undone.", "Supprimer cette image ? Cette action est irréversible."],

  ["الوصول إلى لوحة المتجر.", "Enter the store dashboard.", "Accédez au tableau de bord de la boutique."],
  ["إنشاء الحساب وبدء رحلة المتجر.", "Create an account and start the store journey.", "Créer un compte et commencer le parcours boutique."],
  ["يرجى إرفاق إثبات الدفع.", "Please attach the payment proof.", "Veuillez joindre la preuve de paiement."],
  ["السلة تحتوي منتجات من متاجر مختلفة. يُرجى إفراغ السلة والبدء من متجر واحد.", "Your cart contains products from different stores. Please empty the cart and start from one store.", "Votre panier contient des produits de différentes boutiques. Videz le panier et recommencez avec une seule boutique."],
  ["يرجى التأكد من تطابق كلمتي المرور واحتوائهما على 6 أحرف على الأقل.", "Please make sure the passwords match and contain at least 6 characters.", "Vérifiez que les mots de passe correspondent et contiennent au moins 6 caractères."],
  ["الرابط غير صالح أو منتهي. يرجى طلب رابط جديد.", "The link is invalid or expired. Please request a new link.", "Le lien est invalide ou expiré. Veuillez demander un nouveau lien."],
  ["SKU (اختياري)", "SKU (optional)", "SKU (facultatif)"],
  ["اكتب ردًا...", "Write a reply...", "Écrivez une réponse..."],
  ["اكتب رسالتك", "Write your message", "Écrivez votre message"],
  ["اكتب وصفًا مختصرًا عن متجرك...", "Write a short description of your store...", "Écrivez une brève description de votre boutique..."],
  ["الصورة التالية", "Next image", "Image suivante"],
  ["الصورة السابقة", "Previous image", "Image précédente"],
  ["الطلب غير موجود أو لا تملك صلاحية الوصول إليه.", "The order does not exist or you do not have permission to access it.", "La commande n’existe pas ou vous n’avez pas l’autorisation d’y accéder."],
  ["انتهت الجلسة. سجّل الدخول من جديد.", "Your session has expired. Sign in again.", "Votre session a expiré. Connectez-vous à nouveau."],
  ["تعذر إرسال الرسالة. تحقق من البريد وحاول مجددًا.", "Unable to send the message. Check your email and try again.", "Impossible d’envoyer le message. Vérifiez votre e-mail et réessayez."],
  ["تعذر إنشاء الطلب. حاول مرة أخرى.", "Unable to create the order. Please try again.", "Impossible de créer la commande. Réessayez."],
  ["تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مجددًا.", "Unable to connect to the server. Check your internet connection and try again.", "Impossible de se connecter au serveur. Vérifiez votre connexion Internet et réessayez."],
  ["تعذر التحقق من الحساب بعد تسجيل الدخول. حاول مرة أخرى.", "Unable to verify the account after signing in. Please try again.", "Impossible de vérifier le compte après la connexion. Réessayez."],
  ["تم تحديث كلمة المرور بنجاح.", "Password updated successfully.", "Mot de passe mis à jour avec succès."],
  ["حذف المنتج", "Delete product", "Supprimer le produit"],
  ["نافدة", "Out of stock", "Rupture de stock"],
  ["هذا البريد مسجل بالفعل. سجّل الدخول بدلًا من إنشاء حساب جديد.", "This email is already registered. Sign in instead of creating a new account.", "Cet e-mail est déjà enregistré. Connectez-vous au lieu de créer un nouveau compte."],
  ["هذا الرابط مستخدم بالفعل من متجر آخر. اختر رابطًا مختلفًا.", "This URL is already used by another store. Choose a different URL.", "Cette URL est déjà utilisée par une autre boutique. Choisissez une autre URL."],
  ["يجب تأكيد بريدك الإلكتروني أولًا. تحقق من صندوق الوارد.", "Please verify your email first. Check your inbox.", "Veuillez d’abord vérifier votre e-mail. Consultez votre boîte de réception."],
  ["Accent color", "Accent color", "Couleur d’accentuation"],
  ["Primary color", "Primary color", "Couleur principale"],
  ["Reset to defaults", "Reset to defaults", "Réinitialiser par défaut"],
  ["Save customization", "Save customization", "Enregistrer la personnalisation"],
  ["Use theme", "Use theme", "Utiliser le thème"],
  ["Supabase connection failed.", "Supabase connection failed.", "La connexion à Supabase a échoué."],
  ["Supabase connection is working.", "Supabase connection is working.", "La connexion à Supabase fonctionne."],
  ["اختيار", "Choose", "Choisissez"],
  ["إضافة", "Add", "Ajoutez"],
  ["إرفاق", "Attach", "Joignez"],
  ["التحقق", "Check", "Vérifiez"],
  ["تسجيل الدخول", "Sign in", "Connectez-vous"],
  ["التسجيل", "Sign up", "Inscrivez-vous"],
  ["الدخول", "Sign in", "Connectez-vous"],
  ["البدء", "Start", "Commencez"],
  ["إنشاء", "Create", "Créez"],
  ["إرسال", "Send", "Envoyez"],
  ["رفع", "Upload", "Téléversez"],
  ["كتابة", "Write", "Écrivez"],
  ["اختيار الخطة", "Choose a plan", "Choisissez un plan"],
  ["جاهز", "Ready", "Prêt"],
  ["إعادة المحاولة", "Try again", "Réessayez"],
  ["إعادة المحاولة", "Try again", "Réessayez"],

  ["الرئيسية", "Home", "Accueil"],
  ["الطلبات", "Orders", "Commandes"],
  ["المنتجات", "Products", "Produits"],
  ["إعدادات المتجر", "Store settings", "Paramètres de la boutique"],
  ["المظهر", "Appearance", "Apparence"],
  ["الاشتراك", "Subscription", "Abonnement"],
  ["الدعم", "Support", "Support"],
  ["الحساب", "Account", "Compte"],
  ["القائمة", "Menu", "Menu"],
  ["لوحة التحكم", "Dashboard", "Tableau de bord"],
  ["تسجيل الخروج", "Log out", "Se déconnecter"],
  ["تحديث", "Refresh", "Actualiser"],
  ["حفظ", "Save", "Enregistrer"],
  ["حفظ التغييرات", "Save changes", "Enregistrer les modifications"],
  ["حفظ الحالة", "Save status", "Enregistrer le statut"],
  ["حفظ المنتج", "Save product", "Enregistrer le produit"],
  ["حفظ التعديلات", "Save changes", "Enregistrer les modifications"],
  ["إرسال", "Send", "Envoyer"],
  ["إرسال الطلب", "Submit request", "Envoyer la demande"],
  ["إرسال طلب المراجعة", "Submit for review", "Envoyer pour révision"],
  ["إرسال للمراجعة", "Submit for review", "Envoyer pour révision"],
  ["جاري التحميل...", "Loading...", "Chargement..."],
  ["جاري الحفظ...", "Saving...", "Enregistrement..."],
  ["جاري الإرسال...", "Sending...", "Envoi..."],
  ["جاري إنشاء المتجر...", "Creating store...", "Création de la boutique..."],
  ["جاري الحذف...", "Deleting...", "Suppression..."],
  ["جاري الرفع...", "Uploading...", "Téléversement..."],
  ["جاري تسجيل الخروج...", "Signing out...", "Déconnexion..."],
  ["جاري حفظ المنتج والصور...", "Saving product and images...", "Enregistrement du produit et des images..."],
  ["جاري إعادة الضبط...", "Resetting...", "Réinitialisation..."],
  ["قيد الانتظار", "Pending", "En attente"],
  ["قيد المراجعة", "Pending review", "En attente de révision"],
  ["فعال", "Active", "Actif"],
  ["نشط", "Active", "Actif"],
  ["نشطة", "Active", "Active"],
  ["غير فعال", "Inactive", "Inactif"],
  ["غير نشط", "Inactive", "Inactif"],
  ["غير نشطة", "Inactive", "Inactive"],
  ["منتهي", "Expired", "Expiré"],
  ["ملغى", "Cancelled", "Annulé"],
  ["مؤكد", "Confirmed", "Confirmé"],
  ["مؤكدة", "Confirmed", "Confirmée"],
  ["تم الشحن", "Shipped", "Expédié"],
  ["تم التسليم", "Delivered", "Livré"],
  ["اشتراك فعال", "Active subscription", "Abonnement actif"],
  ["إجمالي المبيعات", "Total sales", "Ventes totales"],
  ["إجمالي الطلبات", "Total orders", "Total des commandes"],
  ["إجمالي المنتجات", "Total products", "Total des produits"],
  ["إجمالي المتاجر", "Total stores", "Total des boutiques"],
  ["المبيعات", "Sales", "Ventes"],
  ["متوسط الطلب", "Average order", "Panier moyen"],
  ["العملاء", "Customers", "Clients"],
  ["المتاجر", "Stores", "Boutiques"],
  ["المتجر غير موجود", "Store not found", "Boutique introuvable"],
  ["المتجر غير موجود.", "Store not found.", "Boutique introuvable."],
  ["المتجر غير موجود أو غير متاح.", "Store not found or unavailable.", "Boutique introuvable ou indisponible."],
  ["لم يتم العثور على متجر مرتبط بهذا الحساب.", "No store is linked to this account.", "Aucune boutique n’est liée à ce compte."],
  ["لم يتم العثور على متجرك.", "Your store could not be found.", "Votre boutique est introuvable."],
  ["لم يتم العثور على المنتج.", "Product not found.", "Produit introuvable."],
  ["المنتج غير موجود.", "Product not found.", "Produit introuvable."],
  ["الطلب غير موجود.", "Order not found.", "Commande introuvable."],
  ["رقم الطلب غير صالح.", "Invalid order ID.", "Identifiant de commande invalide."],
  ["تعذر تحميل الطلب.", "Unable to load the order.", "Impossible de charger la commande."],
  ["تعذر تحميل الطلبات.", "Unable to load orders.", "Impossible de charger les commandes."],
  ["تعذر تحديث حالة الطلب.", "Unable to update order status.", "Impossible de mettre à jour le statut de la commande."],
  ["تم تحديث حالة الطلب بنجاح.", "Order status updated successfully.", "Statut de la commande mis à jour avec succès."],
  ["تعذر تحميل التحليلات.", "Unable to load analytics.", "Impossible de charger les analyses."],
  ["تعذر التحميل.", "Unable to load.", "Impossible de charger."],
  ["تعذر تنفيذ العملية.", "Unable to complete the operation.", "Impossible de terminer l’opération."],
  ["تعذر تنفيذ الإجراء.", "Unable to perform the action.", "Impossible d’effectuer l’action."],
  ["تعذر إنشاء الطلب", "Unable to create the order", "Impossible de créer la commande"],
  ["تعذر إنشاء الطلب. يُرجى إعادة المحاولة.", "Unable to create the order. Please try again.", "Impossible de créer la commande. Réessayez."],
  ["تعذر إرسال الطلب.", "Unable to submit the request.", "Impossible d’envoyer la demande."],
  ["تعذر إرسال الرسالة. يُرجى التحقق من البريد وإعادة المحاولة.", "Unable to send the message. Check your email and try again.", "Impossible d’envoyer le message. Vérifiez votre e-mail et réessayez."],
  ["تعذر حفظ المنتج.", "Unable to save the product.", "Impossible d’enregistrer le produit."],
  ["تعذر تحميل المظهر.", "Unable to load appearance settings.", "Impossible de charger les paramètres d’apparence."],
  ["تعذر حفظ المظهر.", "Unable to save appearance settings.", "Impossible d’enregistrer les paramètres d’apparence."],
  ["تعذر إعادة الضبط.", "Unable to reset.", "Impossible de réinitialiser."],
  ["تعذر إعادة ترتيب الصور.", "Unable to reorder images.", "Impossible de réorganiser les images."],
  ["تعذر تحديث الصورة الرئيسية.", "Unable to update the main image.", "Impossible de mettre à jour l’image principale."],
  ["تعذر تحميل بيانات المتجر.", "Unable to load store data.", "Impossible de charger les données de la boutique."],
  ["تعذر نسخ الرابط، انسخيه يدويًا.", "Unable to copy the link. Copy it manually.", "Impossible de copier le lien. Copiez-le manuellement."],
  ["تعذر الاتصال بالخادم. يُرجى التحقق من اتصال الإنترنت وإعادة المحاولة.", "Unable to connect to the server. Check your internet connection and try again.", "Impossible de se connecter au serveur. Vérifiez votre connexion Internet et réessayez."],
  ["تعذر التحقق من الحساب بعد تسجيل الدخول. يُرجى إعادة المحاولة.", "Unable to verify the account after signing in. Please try again.", "Impossible de vérifier le compte après la connexion. Réessayez."],
  ["يجب تسجيل الدخول أولًا.", "You must sign in first.", "Vous devez d’abord vous connecter."],
  ["انتهت الجلسة. يُرجى تسجيل الدخول من جديد.", "Your session has expired. Please sign in again.", "Votre session a expiré. Connectez-vous à nouveau."],
  ["اسم العميل", "Customer name", "Nom du client"],
  ["الهاتف", "Phone", "Téléphone"],
  ["البريد الإلكتروني", "Email", "E-mail"],
  ["الولاية", "State", "Wilaya"],
  ["البلدية", "Municipality", "Commune"],
  ["العنوان", "Address", "Adresse"],
  ["ملاحظات", "Notes", "Notes"],
  ["تاريخ الطلب", "Order date", "Date de commande"],
  ["رابط المنتج", "Product URL", "URL du produit"],
  ["الوصف", "Description", "Description"],
  ["وصف مختصر للمنتج...", "Short product description...", "Brève description du produit..."],
  ["اسم المنتج", "Product name", "Nom du produit"],
  ["اسم المتجر لا يمكن أن يكون فارغًا.", "Store name cannot be empty.", "Le nom de la boutique ne peut pas être vide."],
  ["رابط المتجر يجب أن يتكوّن من 3 أحرف على الأقل.", "Store URL must contain at least 3 characters.", "L’URL de la boutique doit contenir au moins 3 caractères."],
  ["رابط المتجر يجب أن يتكوّن من 3 أحرف على الأقل، وأحرف إنجليزية وأرقام وشرطات فقط.", "Store URL must contain at least 3 characters and use only English letters, numbers, and hyphens.", "L’URL de la boutique doit contenir au moins 3 caractères et utiliser uniquement des lettres anglaises, des chiffres et des tirets."],
  ["عملة المتجر لا يمكن أن تكون فارغة.", "Store currency cannot be empty.", "La devise de la boutique ne peut pas être vide."],
  ["قيمة تكلفة التوصيل غير صالحة.", "Invalid shipping fee.", "Frais de livraison invalides."],
  ["هذا الرابط مستخدم بالفعل من متجر آخر. يُرجى اختيار رابط مختلف.", "This URL is already used by another store. Choose a different URL.", "Cette URL est déjà utilisée par une autre boutique. Choisissez une autre URL."],
  ["هذا الرابط مستخدم من متجر آخر. يُرجى اختيار رابط مختلف.", "This URL is already used by another store. Choose a different URL.", "Cette URL est déjà utilisée par une autre boutique. Choisissez une autre URL."],
  ["نسخ الرابط", "Copy link", "Copier le lien"],
  ["تم نسخ الرابط ✓", "Link copied ✓", "Lien copié ✓"],
  ["تم حفظ التغييرات بنجاح.", "Changes saved successfully.", "Modifications enregistrées avec succès."],
  ["تم حفظ تخصيص المتجر بنجاح.", "Store customization saved successfully.", "Personnalisation de la boutique enregistrée avec succès."],
  ["تم تحديث الشعار بنجاح.", "Logo updated successfully.", "Logo mis à jour avec succès."],
  ["تمت إزالة الشعار.", "Logo removed.", "Logo supprimé."],
  ["تمت الإضافة ✓", "Added ✓", "Ajouté ✓"],
  ["أضف إلى السلة", "Add to cart", "Ajouter au panier"],
  ["متوفر", "Available", "Disponible"],
  ["نفد المخزون", "Out of stock", "Rupture de stock"],
  ["مخزون منخفض", "Low stock", "Stock faible"],
  ["المخزون", "Stock", "Stock"],
  ["السلة والطلبات", "Cart and orders", "Panier et commandes"],
  ["إدارة المنتجات والصور", "Manage products and images", "Gérer les produits et les images"],
  ["Theme أساسي", "Basic theme", "Thème de base"],
  ["Themes وتخصيص المظهر", "Themes and appearance customization", "Thèmes et personnalisation de l’apparence"],
  ["Themes متقدمة", "Advanced themes", "Thèmes avancés"],
  ["تخصيص أساسي", "Basic customization", "Personnalisation de base"],
  ["تخصيصات متقدمة", "Advanced customization", "Personnalisations avancées"],
  ["كل مزايا Starter", "All Starter features", "Toutes les fonctionnalités Starter"],
  ["كل مزايا Starter مع Themes وتخصيصات متقدمة.", "All Starter features with advanced themes and customization.", "Toutes les fonctionnalités Starter avec des thèmes et personnalisations avancés."],
  ["السعر (DZD)", "Price (DZD)", "Prix (DZD)"],
  ["السعر قبل التخفيض", "Original price", "Prix avant remise"],
  ["السعر قبل التخفيض (اختياري)", "Original price (optional)", "Prix avant remise (facultatif)"],
  ["السعر الأقل", "Lowest price", "Prix le plus bas"],
  ["السعر الأعلى", "Highest price", "Prix le plus élevé"],
  ["السعر غير محدد", "Price not specified", "Prix non défini"],
  ["السعر يُحدد من إعدادات Nexora", "Price is defined in Nexora settings", "Le prix est défini dans les paramètres Nexora"],
  ["السعر: من الأقل للأعلى", "Price: low to high", "Prix : du plus bas au plus élevé"],
  ["السعر: من الأعلى للأقل", "Price: high to low", "Prix : du plus élevé au plus bas"],
  ["الأحدث", "Newest", "Plus récent"],
  ["الأقدم", "Oldest", "Plus ancien"],
  ["الأعلى سعرًا", "Highest price", "Prix le plus élevé"],
  ["الأقل سعرًا", "Lowest price", "Prix le plus bas"],
  ["الاسم A-Z", "Name A-Z", "Nom A-Z"],
  ["الاسم Z-A", "Name Z-A", "Nom Z-A"],
  ["الاسم أبجديًا", "Name alphabetically", "Nom par ordre alphabétique"],
  ["الموضوع", "Subject", "Sujet"],
  ["كتابة رسالتك", "Write your message", "Écrivez votre message"],
  ["كتابة رد...", "Write a reply...", "Écrivez une réponse..."],
  ["رد الإدارة...", "Admin reply...", "Réponse de l’administration..."],
  ["مشكلة تقنية", "Technical issue", "Problème technique"],
  ["مشكلة في المتجر", "Store issue", "Problème de boutique"],
  ["الدفع", "Payment", "Paiement"],
  ["سؤال عام", "General question", "Question générale"],
  ["طلب جديد", "New request", "Nouvelle demande"],
  ["محادثاتي", "My conversations", "Mes conversations"],
  ["لا توجد محادثات.", "No conversations.", "Aucune conversation."],
  ["لا توجد طلبات.", "No requests.", "Aucune demande."],
  ["لا توجد طلبات بعد.", "No requests yet.", "Aucune demande pour le moment."],
  ["طلبات الاشتراك والدفع", "Subscription and payment requests", "Demandes d’abonnement et de paiement"],
  ["دعم التجار", "Merchant support", "Support des marchands"],
  ["المالك", "Owner", "Propriétaire"],
  ["غير معروف", "Unknown", "Inconnu"],
  ["نعم", "Yes", "Oui"],
  ["لا", "No", "Non"],
  ["مرئي في المتجر", "Visible in store", "Visible dans la boutique"],
  ["لا يوجد اشتراك", "No subscription", "Aucun abonnement"],
  ["الخطة الحالية", "Current plan", "Plan actuel"],
  ["الموافقة والتفعيل", "Approve and activate", "Approuver et activer"],
  ["رفض الطلب", "Reject request", "Refuser la demande"],
  ["سبب الرفض، مطلوب عند الرفض", "Rejection reason, required when rejecting", "Motif du rejet, obligatoire en cas de refus"],
  ["فتح إثبات الدفع", "Open payment proof", "Ouvrir la preuve de paiement"],
  ["فتح الرابط المؤقت", "Open temporary link", "Ouvrir le lien temporaire"],
  ["المبلغ", "Amount", "Montant"],
  ["المرجع", "Reference", "Référence"],
  ["غير محدد", "Not specified", "Non défini"],
  ["إرفاق إثبات الدفع.", "Attach payment proof.", "Joignez la preuve de paiement."],
  ["إثبات الدفع", "Payment proof", "Preuve de paiement"],
  ["رقم/مرجع الدفع (اختياري)", "Payment number/reference (optional)", "Numéro/référence de paiement (facultatif)"],
  ["مرجع الدفع (اختياري)", "Payment reference (optional)", "Référence de paiement (facultatif)"],
  ["تفعيل الاشتراك (سيتواصل معك فريق Nexora)", "Activate subscription (the Nexora team will contact you)", "Activer l’abonnement (l’équipe Nexora vous contactera)"],
  ["تم إرسال طلب الدفع. سيظهر هنا بعد مراجعة الإدارة.", "Payment request submitted. It will appear here after admin review.", "Demande de paiement envoyée. Elle apparaîtra ici après examen par l’administration."],
  ["تم تحديث الاشتراك بنجاح.", "Subscription updated successfully.", "Abonnement mis à jour avec succès."],
  ["تمت الموافقة على الاشتراك", "Subscription approved", "Abonnement approuvé"],
  ["تم رفض الطلب", "Request rejected", "Demande refusée"],
  ["يرجى إعادة إرسال الإثبات.", "Please resubmit the proof.", "Veuillez renvoyer la preuve."],
  ["طلبك قيد المراجعة", "Your request is under review", "Votre demande est en cours d’examen"],
  ["تمت الموافقة", "Approved", "Approuvé"],
  ["مقبول", "Approved", "Accepté"],
  ["مرفوض", "Rejected", "Refusé"],
  ["الكل", "All", "Tous"],
  ["إتمام الطلب", "Complete request", "Finaliser la demande"],
  ["تأكيد الطلب", "Confirm order", "Confirmer la commande"],
  ["جاري إرسال الطلب...", "Submitting order...", "Envoi de la commande..."],
  ["الاسم الكامل", "Full name", "Nom complet"],
  ["رقم الهاتف", "Phone number", "Numéro de téléphone"],
  ["المجموع الفرعي", "Subtotal", "Sous-total"],
  ["التوصيل", "Shipping", "Livraison"],
  ["الإجمالي", "Total", "Total"],
  ["مجاني", "Free", "Gratuit"],
  ["السلة تحتوي منتجات من متاجر مختلفة. يُرجى إفراغ السلة والبدء من متجر واحد.", "Your cart contains products from different stores. Empty the cart and start with one store.", "Votre panier contient des produits de différentes boutiques. Videz le panier et recommencez avec une seule boutique."],
  ["تم حذف منتج أو أكثر من سلتك لأنه لم يعد متاحًا.", "One or more products were removed because they are no longer available.", "Un ou plusieurs produits ont été retirés car ils ne sont plus disponibles."],
  ["تم تحديث سعر بعض المنتجات.", "Some product prices were updated.", "Le prix de certains produits a été mis à jour."],
  ["تم تعديل كمية بعض المنتجات بسبب نقص المخزون.", "Some quantities were adjusted because of low stock.", "Certaines quantités ont été ajustées en raison d’un stock insuffisant."],
  ["ابحث باسم المنتج أو SKU...", "Search by product name or SKU...", "Rechercher par nom de produit ou SKU..."],
  ["ابحثي عن منتج بالاسم أو SKU...", "Search for a product by name or SKU...", "Rechercher un produit par nom ou SKU..."],
  ["ابحث بالاسم أو الهاتف...", "Search by name or phone...", "Rechercher par nom ou téléphone..."],
  ["ابحث برقم الطلب أو اسم العميل أو الهاتف...", "Search by order number, customer name, or phone...", "Rechercher par numéro de commande, nom du client ou téléphone..."],
  ["مثال: متجر الأناقة", "Example: Elegance Store", "Exemple : Boutique Élégance"],
  ["مثال: حقيبة جلدية", "Example: Leather bag", "Exemple : Sac en cuir"],
  ["بضع كلمات عن متجرك ومنتجاتك...", "A few words about your store and products...", "Quelques mots sur votre boutique et vos produits..."],
  ["إنشاء المتجر", "Create store", "Créer la boutique"],
  ["إنشاء متجرك", "Create your store", "Créez votre boutique"],
  ["إنشاء حسابك", "Create your account", "Créez votre compte"],
  ["إنشاء الحساب وبدء رحلة المتجر.", "Create your account and start your store journey.", "Créez votre compte et commencez votre aventure boutique."],
  ["الدخول إلى لوحة المتجر.", "Enter your store dashboard.", "Accédez au tableau de bord de votre boutique."],
  ["اختيار الخطة وإرسال إثبات الدفع", "Choose a plan and submit payment proof", "Choisissez un plan et envoyez la preuve de paiement"],
  ["بعد المراجعة، تخصيص المتجر والبدء بالبيع", "After review, customize your store and start selling", "Après validation, personnalisez votre boutique et commencez à vendre"],
  ["البدء في بناء المتجر؟", "Ready to build your store?", "Prêt à créer votre boutique ?"],
  ["البدء بإنشاء الحساب، وسنقودك خلال إنشاء المتجر والاشتراك والمراجعة.", "Start with an account and we’ll guide you through store creation, subscription, and review.", "Commencez avec un compte et nous vous guiderons pour créer la boutique, vous abonner et passer la validation."],
  ["منصة منظمة بدل تجميع أدوات متفرقة.", "One organized platform instead of scattered tools.", "Une plateforme organisée au lieu d’outils dispersés."],
  ["إنشاء المتجر. تخصيص التجربة. والبدء بالبيع.", "Build your store. Customize your experience. Start selling.", "Créez votre boutique. Personnalisez votre expérience. Commencez à vendre."],
  ["Nexora تجمع لك أساسيات التجارة الإلكترونية في منصة واحدة: المنتجات، الطلبات، السلة، checkout، Themes، والتخصيص.", "Nexora brings the essentials of e-commerce into one platform: products, orders, cart, checkout, themes, and customization.", "Nexora réunit l’essentiel du e-commerce sur une seule plateforme : produits, commandes, panier, paiement, thèmes et personnalisation."],
  ["رحلة واضحة من الحساب إلى المتجر", "A clear journey from account to store", "Un parcours clair du compte à la boutique"],
  ["أساس قوي لمتجرك", "A strong foundation for your store", "Une base solide pour votre boutique"],
  ["سلة وCheckout وطلبات", "Cart, checkout, and orders", "Panier, paiement et commandes"],
  ["Themes وتخصيص المظهر", "Themes and appearance customization", "Thèmes et personnalisation de l’apparence"],
  ["Dashboard وAdmin وإدارة الاشتراك", "Dashboard, admin, and subscription management", "Tableau de bord, administration et gestion des abonnements"],
  ["Starter و Business", "Starter and Business", "Starter et Business"],
  ["الأساسيات لتشغيل متجر إلكتروني.", "Essentials for running an online store.", "L’essentiel pour gérer une boutique en ligne."],
  ["كل مزايا Starter مع Themes وتخصيصات متقدمة.", "All Starter features plus advanced themes and customization.", "Toutes les fonctionnalités Starter avec des thèmes et personnalisations avancés."],
  ["الأسعار مركزية في إعدادات Nexora ولا يتم اختراعها داخل الواجهة.", "Prices are centralized in Nexora settings and are not hardcoded in the interface.", "Les prix sont centralisés dans les paramètres Nexora et ne sont pas codés en dur dans l’interface."],
  ["مساحة جاهز لإضافة فيديو أو قصة منتج مستقبلًا.", "A space ready for a future video or product story.", "Un espace prêt pour une future vidéo ou histoire produit."],
  ["تأكدي من تطابق كلمتي المرور وأن تحتوي على 6 أحرف على الأقل.", "Make sure the passwords match and contain at least 6 characters.", "Vérifiez que les mots de passe correspondent et contiennent au moins 6 caractères."],
  ["البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Email or password is incorrect.", "L’e-mail ou le mot de passe est incorrect."],
  ["يجب تأكيد البريد الإلكتروني أولًا. يُرجى التحقق من صندوق الوارد.", "Please verify your email first. Check your inbox.", "Veuillez d’abord vérifier votre e-mail. Consultez votre boîte de réception."],
  ["هذا البريد مسجل بالفعل. يُرجى تسجيل الدخول بدلًا من إنشاء حساب جديد.", "This email is already registered. Sign in instead of creating a new account.", "Cet e-mail est déjà enregistré. Connectez-vous au lieu de créer un nouveau compte."],
  ["كلمة المرور قصيرة جدًا. استخدم 6 أحرف على الأقل.", "Password is too short. Use at least 6 characters.", "Le mot de passe est trop court. Utilisez au moins 6 caractères."],
  ["صيغة البريد الإلكتروني غير صحيحة.", "Invalid email format.", "Format d’e-mail invalide."],
  ["كلمتا المرور غير متطابقتين.", "Passwords do not match.", "Les mots de passe ne correspondent pas."],
  ["هل تريدين إزالة شعار المتجر؟", "Remove the store logo?", "Supprimer le logo de la boutique ?"],
  ["هل تريدين حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.", "Delete this image? This action cannot be undone.", "Supprimer cette image ? Cette action est irréversible."],
  ["الشعار", "Logo", "Logo"],
  ["رفع شعار", "Upload logo", "Téléverser le logo"],
  ["استبدال الشعار", "Replace logo", "Remplacer le logo"],
  ["تغيير الصورة", "Change image", "Changer l’image"],
  ["إعدادات الشحن والعملة", "Shipping and currency settings", "Paramètres de livraison et de devise"],
  ["يُسمح فقط بصور بصيغة JPG أو PNG أو WEBP.", "Only JPG, PNG, or WEBP images are allowed.", "Seules les images JPG, PNG ou WEBP sont autorisées."],
  ["حجم الشعار يجب ألا يتجاوز 5MB.", "Logo size must not exceed 5MB.", "La taille du logo ne doit pas dépasser 5 Mo."],
  ["حجم كل صورة يجب ألا يتجاوز 5MB.", "Each image must not exceed 5MB.", "Chaque image ne doit pas dépasser 5 Mo."],
  ["لم يتم اختيار أي صورة صالحة.", "No valid image was selected.", "Aucune image valide n’a été sélectionnée."],
  ["خطأ غير معروف", "Unknown error", "Erreur inconnue"],
  ["نفدت", "Out of stock", "Rupture de stock"],
  ["متجرك", "Your store", "Votre boutique"],
  ["مؤكدة", "Confirmed", "Confirmée"],
  ["ملاحظات", "Notes", "Notes"],
  ["غير محدد", "Not specified", "Non défini"],
  ["غير معروف", "Unknown", "Inconnu"],
  ["البريد مؤكَّد", "Email verified", "E-mail vérifié"],
  ["بانتظار تأكيد البريد", "Awaiting email verification", "En attente de vérification de l’e-mail"],
  ["السعر غير محدد", "Price not specified", "Prix non défini"],
  ["هذه الميزة متاحة ضمن خطة Business.", "This feature is available on the Business plan.", "Cette fonctionnalité est disponible avec le plan Business."],
  ["تخصيص الخطوط متاح ضمن خطة Business.", "Font customization is available on the Business plan.", "La personnalisation des polices est disponible avec le plan Business."],
  ["تمت إعادة المظهر إلى Minimal وإعداداته الافتراضية.", "Appearance reset to Minimal and its default settings.", "L’apparence a été réinitialisée sur Minimal avec ses paramètres par défaut."],
  ["تمت إعادة إرسال رسالة التحقق.", "Verification email resent.", "E-mail de vérification renvoyé."],
  ["إذا كان البريد صالحًا، ستصلك رسالة لإعادة تعيين كلمة المرور.", "If the email is valid, you will receive a password reset message.", "Si l’e-mail est valide, vous recevrez un message pour réinitialiser le mot de passe."],
  ["إذا كان البريد صالحًا، ستصلك رسالة لإعادة تعيين كلمة المرور.", "If the email is valid, you will receive a password reset message.", "Si l’e-mail est valide, vous recevrez un message pour réinitialiser le mot de passe."],
  ["الاشتراكات", "Subscriptions", "Abonnements"],
  ["المالك", "Owner", "Propri\u00e9taire"],
  ["تاريخ الإنشاء", "Created", "Cr\u00e9ation"],
  ["مرئي في المتجر", "Visible in store", "Visible dans la boutique"],
  ["الخطة الحالية", "Current plan", "Plan actuel"],
  ["الحالة", "Status", "Statut"],
  ["طلبات الاشتراك والدفع", "Subscription and payment requests", "Demandes d\u2019abonnement et de paiement"],
  ["مراجعة إثباتات الدفع قبل تفعيل الاشتراك.", "Review payment proofs before activating subscriptions.", "V\u00e9rifiez les preuves de paiement avant d\u2019activer les abonnements."],
  ["لا توجد طلبات.", "No requests.", "Aucune demande."],
  ["مفتوح", "Open", "Ouvert"],
  ["حل", "Resolve", "R\u00e9soudre"],
  ["دعم التجار", "Merchant support", "Support des marchands"],
  ["لا توجد محادثات.", "No conversations.", "Aucune conversation."],
  ["السلة", "Cart", "Panier"],
  ["السلة 🛒", "Cart \ud83d\uded2", "Panier \ud83d\uded2"],
  ["سلة المشتريات 🛒", "Shopping cart \ud83d\uded2", "Panier d\u2019achat \ud83d\uded2"],
  ["إضافة منتج", "+ Add product", "+ Ajouter un produit"],
  ["+ إضافة منتج", "+ Add product", "+ Ajouter un produit"],
  ["إضافة منتج", "Add product", "Ajouter un produit"],
  ["إضافة أول منتج", "Add your first product", "Ajouter votre premier produit"],
  ["أضف بيانات المنتج وصوره إلى متجرك.", "Add product details and images to your store.", "Ajoutez les informations et images du produit \u00e0 votre boutique."],
  ["أضف منتجًا من المتجر أولًا لإتمام الطلب.", "Add a product from the store first to complete the order.", "Ajoutez d\u2019abord un produit depuis la boutique pour finaliser la commande."],
  ["أضف منتجًا أولًا من المتجر.", "Add a product from the store first.", "Ajoutez d\u2019abord un produit depuis la boutique."],
  ["أول منتج لمتجرك يبدأ من هنا.", "Your store\u2019s first product starts here.", "Le premier produit de votre boutique commence ici."],
  ["أنشئ متجرك الأول", "Create your first store", "Cr\u00e9ez votre premi\u00e8re boutique"],
  ["التحليلات", "Analytics", "Analyses"],
  ["المبيعات اليومية", "Daily sales", "Ventes quotidiennes"],
  ["حالات الطلبات", "Order statuses", "Statuts des commandes"],
  ["أفضل المنتجات · آخر 30 يومًا", "Top products \u00b7 Last 30 days", "Meilleurs produits \u00b7 30 derniers jours"],
  ["آخر طلب", "Last order", "Derni\u00e8re commande"],
  ["الإنفاق", "Spending", "D\u00e9penses"],
  ["العميل", "Customer", "Client"],
  ["الكمية", "Quantity", "Quantit\u00e9"],
  ["المخزون بحالة جيدة ✓", "Stock is healthy \u2713", "Le stock est suffisant \u2713"],
  ["تنبيه المخزون", "Stock alert", "Alerte de stock"],
  ["المنتجات الأكثر مبيعًا", "Best-selling products", "Produits les plus vendus"],
  ["المنتجات المطلوبة", "Requested products", "Produits demand\u00e9s"],
  ["المنتج نشط", "Product active", "Produit actif"],
  ["المظهر والتخصيص", "Appearance and customization", "Apparence et personnalisation"],
  ["المظهر يغيّر طريقة عرض نفس المنتجات والسلة والشراء.", "Appearance changes how the same products, cart, and checkout are displayed.", "L\u2019apparence modifie l\u2019affichage des m\u00eames produits, du panier et du paiement."],
  ["اختر مظهرًا جاهزًا ثم خصصي ألوان متجرك وهويته البصرية.", "Choose a ready-made appearance, then customize your store colors and visual identity.", "Choisissez une apparence pr\u00eate \u00e0 l\u2019emploi, puis personnalisez les couleurs et l\u2019identit\u00e9 visuelle de votre boutique."],
  ["تعديلاتك تستبدل ألوان الثيم فقط، ولا تغيّر منطق المتجر.", "Your changes only replace theme colors and do not change store logic.", "Vos modifications remplacent uniquement les couleurs du th\u00e8me et ne changent pas la logique de la boutique."],
  ["خطوط آمنة من النظام بدون تحميل أصول ثقيلة.", "System-safe fonts without loading heavy assets.", "Polices syst\u00e8me s\u00fbres sans charger de ressources lourdes."],
  ["بيانات المتجر", "Store data", "Donn\u00e9es de la boutique"],
  ["معلومات المتجر", "Store information", "Informations de la boutique"],
  ["إدارة بيانات المتجر ←", "Manage store data \u2192", "G\u00e9rer les donn\u00e9es de la boutique \u2192"],
  ["عدّل بيانات متجرك العامة وإعدادات الشحن.", "Edit your store details and shipping settings.", "Modifiez les informations g\u00e9n\u00e9rales de votre boutique et les param\u00e8tres de livraison."],
  ["وصف المتجر", "Store description", "Description de la boutique"],
  ["اسم المتجر", "Store name", "Nom de la boutique"],
  ["رابط المتجر", "Store URL", "URL de la boutique"],
  ["العملة", "Currency", "Devise"],
  ["الشحن والعملة", "Shipping and currency", "Livraison et devise"],
  ["تكلفة التوصيل الافتراضية", "Default shipping fee", "Frais de livraison par d\u00e9faut"],
  ["صور المنتج", "Product images", "Images du produit"],
  ["شعار المتجر", "Store logo", "Logo de la boutique"],
  ["تاريخ إنشاء الحساب", "Account creation date", "Date de cr\u00e9ation du compte"],
  ["تصفّح المتاجر", "Browse stores", "Parcourir les boutiques"],
  ["عرض المتجر", "View store", "Voir la boutique"],
  ["عرض جميع الطلبات", "View all orders", "Voir toutes les commandes"],
  ["أحدث الطلبات", "Recent orders", "Commandes r\u00e9centes"],
  ["لوحة تحكم Nexora", "Nexora Dashboard", "Tableau de bord Nexora"],
  ["اللوحة", "Dashboard", "Tableau de bord"],
  ["متجر إلكتروني", "Online store", "Boutique en ligne"],
  ["نظرة عامة على المتاجر والاشتراكات.", "Overview of stores and subscriptions.", "Vue d\u2019ensemble des boutiques et abonnements."],
  ["هذه اللوحة مخصصة لفريق Nexora فقط.", "This dashboard is for the Nexora team only.", "Ce tableau de bord est r\u00e9serv\u00e9 \u00e0 l\u2019\u00e9quipe Nexora."],
  ["لا توجد متاجر بعد.", "No stores yet.", "Aucune boutique pour le moment."],
  ["لا توجد منتجات بعد", "No products yet", "Aucun produit pour le moment"],
  ["لا توجد منتجات متاحة حاليًا", "No products are currently available", "Aucun produit n\u2019est actuellement disponible"],
  ["لا توجد طلبات حتى الآن", "No orders yet", "Aucune commande pour le moment"],
  ["لا توجد مبيعات كافية بعد.", "Not enough sales yet.", "Pas encore assez de ventes."],
  ["لا يوجد عملاء مطابقون.", "No matching customers.", "Aucun client correspondant."],
  ["لم نجد أي طلب مطابق", "No matching order found", "Aucune commande correspondante trouv\u00e9e"],
  ["لم نجد أي منتج مطابق", "No matching product found", "Aucun produit correspondant trouv\u00e9"],
  ["لا توجد صور بعد", "No images yet", "Aucune image pour le moment"],
  ["لا توجد صورة", "No image", "Aucune image"],
  ["المحادثة غير موجودة.", "Conversation not found.", "Conversation introuvable."],
  ["غير مصرح لك بالوصول", "You are not authorized to access this.", "Vous n\u2019\u00eates pas autoris\u00e9 \u00e0 acc\u00e9der \u00e0 cette ressource."],
  ["كل الحالات", "All statuses", "Tous les statuts"],
  ["كل المخزون", "All stock", "Tout le stock"],
  ["مسح الفلاتر", "Clear filters", "Effacer les filtres"],
  ["معاينة سريعة", "Quick preview", "Aper\u00e7u rapide"],
  ["معلومات التوصيل", "Shipping information", "Informations de livraison"],
  ["معلومات العميل", "Customer information", "Informations client"],
  ["ملخص الطلب", "Order summary", "R\u00e9sum\u00e9 de la commande"],
  ["مميز", "Featured", "\u00c0 la une"],
  ["منتج مميز", "Featured product", "Produit \u00e0 la une"],
  ["منتجات أخرى قد تعجبك", "Other products you may like", "Autres produits susceptibles de vous plaire"],
  ["نص تجريبي للمتجر", "Sample store text", "Texte d\u2019exemple de la boutique"],
  ["اكتشفي مجموعتنا", "Discover our collection", "D\u00e9couvrez notre collection"],
  ["الألوان", "Colors", "Couleurs"],
  ["التوصيل يحسب في صفحة الطلب.", "Shipping is calculated on the order page.", "La livraison est calcul\u00e9e sur la page de commande."],
  ["الحالة الحالية:", "Current status:", "Statut actuel :"],
  ["الخطة:", "Plan:", "Plan :"],
  ["رئيسية", "Main", "Principale"],
  ["تعيين كرئيسية", "Set as main", "D\u00e9finir comme principale"],
  ["إزالة", "Remove", "Supprimer"],
  ["إزالة الشعار", "Remove logo", "Supprimer le logo"],
  ["تغيير الصورة", "Change image", "Changer l\u2019image"],
  ["رفع شعار", "Upload logo", "T\u00e9l\u00e9verser le logo"],
  ["استبدال الشعار", "Replace logo", "Remplacer le logo"],
  ["العودة", "Back", "Retour"],
  ["العودة إلى الطلبات", "Back to orders", "Retour aux commandes"],
  ["العودة إلى المتجر", "Back to store", "Retour \u00e0 la boutique"],
  ["العودة للوحة التحكم", "Back to dashboard", "Retour au tableau de bord"],
  ["العودة لتسجيل الدخول", "Back to login", "Retour \u00e0 la connexion"],
  ["الذهاب إلى لوحة متجري", "Go to my store dashboard", "Acc\u00e9der au tableau de bord de ma boutique"],
  ["الانتقال إلى السلة →", "Go to cart \u2192", "Acc\u00e9der au panier \u2192"],
  ["متابعة التسوق", "Continue shopping", "Continuer les achats"],
  ["متابعة الطلب", "Continue to order", "Continuer la commande"],
  ["تأخير →", "Delay \u2192", "Diff\u00e9rer \u2192"],
  ["→ كل المتاجر", "\u2192 All stores", "\u2192 Toutes les boutiques"],
  ["تغيير الخطة إلى", "Change plan to", "Changer le plan en"],
  ["تفعيل", "Activate", "Activer"],
  ["تعطيل / إلغاء", "Disable / Cancel", "D\u00e9sactiver / Annuler"],
  ["حفظ التاريخ", "Save history", "Enregistrer l\u2019historique"],
  ["رابط غير صالح", "Invalid link", "Lien invalide"],
  ["الرابط غير صالح أو منتهي. اطلبي رابطًا جديدًا.", "The link is invalid or expired. Request a new one.", "Le lien est invalide ou expir\u00e9. Demandez-en un nouveau."],
  ["جاري التحقق من الجلسة...", "Checking session...", "V\u00e9rification de la session..."],
  ["جاري تأكيد الحساب...", "Confirming account...", "Confirmation du compte..."],
  ["جاري تحميل المنتج...", "Loading product...", "Chargement du produit..."],
  ["جاري تحميل تفاصيل الطلب...", "Loading order details...", "Chargement des d\u00e9tails de la commande..."],
  ["جرّب تعديل كلمة البحث أو الفلاتر.", "Try adjusting your search or filters.", "Essayez de modifier votre recherche ou vos filtres."],
  ["جرّب تعديل كلمة البحث أو الفلتر.", "Try adjusting your search or filter.", "Essayez de modifier votre recherche ou votre filtre."],
  ["تم استلام طلبك ❤️", "Your order has been received \u2764\ufe0f", "Votre commande a \u00e9t\u00e9 re\u00e7ue \u2764\ufe0f"],
  ["شكرًا لك. تم تسجيل الطلب وسيتم التواصل معك لتأكيده.", "Thank you. Your order has been recorded and you will be contacted to confirm it.", "Merci. Votre commande a \u00e9t\u00e9 enregistr\u00e9e et vous serez contact\u00e9 pour la confirmer."],
  ["ستظهر مبيعاتك هنا بعد استلام أول طلب", "Your sales will appear here after your first order", "Vos ventes appara\u00eetront ici apr\u00e8s votre premi\u00e8re commande"],
  ["ستظهر هنا الطلبات فور استلامها من صفحة المتجر.", "Orders will appear here as soon as they are received from the store page.", "Les commandes appara\u00eetront ici d\u00e8s leur r\u00e9ception depuis la boutique."],
  ["سيتم عرض المنتجات هنا عندما تصبح متاحة.", "Products will appear here when they become available.", "Les produits appara\u00eetront ici lorsqu\u2019ils seront disponibles."],
  ["خطوة واحدة تفصلك عن بدء البيع أونلاين — يمكنك تعديل كل هذه البيانات لاحقًا من إعدادات المتجر.", "One step away from selling online \u2014 you can edit all of this later from store settings.", "Une \u00e9tape vous s\u00e9pare du lancement en ligne \u2014 vous pourrez modifier toutes ces donn\u00e9es depuis les param\u00e8tres de la boutique."],
  ["أحرف إنجليزية صغيرة وأرقام وشرطات فقط، 3 أحرف على الأقل.", "Lowercase English letters, numbers, and hyphens only, at least 3 characters.", "Lettres anglaises minuscules, chiffres et tirets uniquement, 3 caract\u00e8res minimum."],
  ["اضغط لاختيار صورة أو أكثر", "Click to choose one or more images", "Cliquez pour choisir une ou plusieurs images"],
  ["السلة فارغة", "Your cart is empty", "Votre panier est vide"],
  ["نفد", "Out of stock", "Rupture de stock"],
  ["نفد المخزون — يرجى حذف المنتج للمتابعة", "Out of stock \u2014 please remove the product to continue", "Rupture de stock \u2014 veuillez supprimer le produit pour continuer"],
  ["مختارة", "Selected", "S\u00e9lectionn\u00e9"],
  ["طلبات الدفع", "Payment requests", "Demandes de paiement"],
  ["إعادة الإرسال", "Resubmit", "Renvoyer"],
  ["إرسال إثبات الدفع", "Submit payment proof", "Envoyer la preuve de paiement"],
  ["اختر الخطة ثم أرسلي إثبات الدفع للمراجعة.", "Choose a plan, then submit payment proof for review.", "Choisissez un plan, puis envoyez la preuve de paiement pour examen."],
  ["تمديد الاشتراك حتى", "Extend subscription until", "Prolonger l\u2019abonnement jusqu\u2019au"],
  ["بعد اختيار الخطة، استخدم طريقة الدفع التي يوفرها فريق Nexora، ثم أرفق صورة أو PDF لإثبات الدفع. لا يتم تفعيل الاشتراك حتى تتم المراجعة اليدوية.", "After choosing a plan, use the payment method provided by the Nexora team, then upload an image or PDF as proof. The subscription is activated only after manual review.", "Apr\u00e8s avoir choisi un plan, utilisez le moyen de paiement fourni par l\u2019\u00e9quipe Nexora, puis envoyez une image ou un PDF comme preuve. L\u2019abonnement n\u2019est activ\u00e9 qu\u2019apr\u00e8s examen manuel."],
  ["طريقة الدفع والتعليمات النهائية يقدمها فريق Nexora. أكمل الدفع بالطريقة المتفق عليها ثم ارفعي الإثبات هنا. لن يتم تفعيل الاشتراك من المتصفح.", "The Nexora team provides the payment method and final instructions. Complete the payment as agreed, then upload the proof here. The subscription will not be activated from the browser.", "L\u2019\u00e9quipe Nexora fournit le moyen de paiement et les instructions finales. Effectuez le paiement convenu, puis envoyez la preuve ici. L\u2019abonnement ne sera pas activ\u00e9 depuis le navigateur."],
  ["رقم/مرجع الدفع (اختياري)", "Payment number/reference (optional)", "Num\u00e9ro/r\u00e9f\u00e9rence de paiement (facultatif)"],
  ["مرجع الدفع (اختياري)", "Payment reference (optional)", "R\u00e9f\u00e9rence de paiement (facultatif)"],
  ["Store", "Store", "Boutique"],
  ["Customer information", "Customer information", "Informations client"],
  ["Requested products", "Requested products", "Produits demandés"],
  ["Order summary", "Order summary", "Résumé de la commande"],
  ["Total", "Total", "Total"],
  ["Subtotal", "Subtotal", "Sous-total"],
  ["Shipping", "Shipping", "Livraison"],
  ["Save status", "Save status", "Enregistrer le statut"],
  ["New request", "New request", "Nouvelle demande"],
  ["My conversations", "My conversations", "Mes conversations"],
  ["No image", "No image", "Aucune image"],
  ["✓ Active", "✓ Active", "✓ Actif"],
  ["Available", "Available", "Disponible"],
  ["Low stock", "Low stock", "Stock faible"],
  ["Email address", "Email address", "Adresse e-mail"],
  ["Password", "Password", "Mot de passe"],
  ["Forgot password?", "Forgot password?", "Mot de passe oublié ?"],
  ["Create account", "Create account", "Créer un compte"],
  ["Log in", "Log in", "Se connecter"],
  ["Sign in", "Sign in", "Se connecter"],
  ["Sign up", "Sign up", "S’inscrire"],
  ["View store", "View store", "Voir la boutique"],
  ["Products", "Products", "Produits"],
  ["Orders", "Orders", "Commandes"],
  ["Home", "Home", "Accueil"],
  ["Appearance", "Appearance", "Apparence"],
  ["Subscription", "Subscription", "Abonnement"],
  ["Support", "Support", "Support"],
  ["Account", "Account", "Compte"],
  ["Save changes", "Save changes", "Enregistrer les modifications"],
  ["Refresh", "Refresh", "Actualiser"],
  ["Add product", "Add product", "Ajouter un produit"],

];

const byLanguage = new Map<UiLanguage, Map<string, string>>();
const reverse = new Map<string, Entry>();
for (const [ar, en, fr] of UI_TRANSLATIONS) {
  byLanguage.set("ar", byLanguage.get("ar") ?? new Map());
  byLanguage.set("en", byLanguage.get("en") ?? new Map());
  byLanguage.set("fr", byLanguage.get("fr") ?? new Map());
  byLanguage.get("ar")!.set(ar, ar);
  byLanguage.get("en")!.set(ar, en);
  byLanguage.get("fr")!.set(ar, fr);
  reverse.set(ar, [ar, en, fr]);
  reverse.set(en, [ar, en, fr]);
  reverse.set(fr, [ar, en, fr]);
}

function translateDynamicUiText(text: string, language: UiLanguage): string {
  // Dynamic legacy labels are still translated from their original source
  // shape. Keep the Arabic source rules and also understand the English/French
  // forms so switching back to Arabic never leaves mixed-language fragments.
  if (language === "ar") {
    let m = text.match(/^(\d+) of (\d+) orders$/);
    if (m) return `${m[1]} من ${m[2]} طلب`;
    m = text.match(/^(\d+) sur (\d+) commandes$/);
    if (m) return `${m[1]} من ${m[2]} طلب`;
    m = text.match(/^(\d+) of (\d+) products$/);
    if (m) return `${m[1]} من ${m[2]} منتج`;
    m = text.match(/^(\d+) sur (\d+) produits$/);
    if (m) return `${m[1]} من ${m[2]} منتج`;
    m = text.match(/^Order #(.+)$/);
    if (m) return `طلب #${m[1]}`;
    m = text.match(/^Commande #(.+)$/);
    if (m) return `طلب #${m[1]}`;
    m = text.match(/^Stock:\s*(.+)$/);
    if (m) return `المخزون: ${m[1]}`;
    m = text.match(/^Stock :\s*(.+)$/);
    if (m) return `المخزون: ${m[1]}`;
    m = text.match(/^Available — (.+) items$/);
    if (m) return `متوفر — ${m[1]} قطعة`;
    m = text.match(/^Disponible — (.+) articles$/);
    if (m) return `متوفر — ${m[1]} قطعة`;
    m = text.match(/^(.+) items sold$/);
    if (m) return `${m[1]} قطعة مباعة`;
    m = text.match(/^(.+) articles vendus$/);
    if (m) return `${m[1]} قطعة مباعة`;
    m = text.match(/^(.+) remaining$/);
    if (m) return `${m[1]} متبقي`;
    m = text.match(/^(.+) restant\(s\)$/);
    if (m) return `${m[1]} متبقي`;
    m = text.match(/^Last (.+)$/);
    if (m) return `آخر ${m[1]}`;
    m = text.match(/^Dernier (.+)$/);
    if (m) return `آخر ${m[1]}`;
    return text;
  }
  let m = text.match(/^(\d+) من (\d+) طلب$/);
  if (m) return language === "en" ? `${m[1]} of ${m[2]} orders` : `${m[1]} sur ${m[2]} commandes`;
  m = text.match(/^(\d+) من (\d+) منتج$/);
  if (m) return language === "en" ? `${m[1]} of ${m[2]} products` : `${m[1]} sur ${m[2]} produits`;
  m = text.match(/^طلب #(.+)$/);
  if (m) return language === "en" ? `Order #${m[1]}` : `Commande #${m[1]}`;
  m = text.match(/^متجر (.+) — مدعوم بواسطة Nexora$/);
  if (m) return language === "en" ? `Store ${m[1]} — Powered by Nexora` : `Boutique ${m[1]} — Propulsée par Nexora`;
  m = text.match(/^حتى (.+)$/);
  if (m) return language === "en" ? `until ${m[1]}` : `jusqu’au ${m[1]}`;
  m = text.match(/^تم تفعيل (.+)\.$/);
  if (m) return language === "en" ? `${m[1]} activated.` : `${m[1]} activé.`;
  m = text.match(/^المخزون: (.+)$/);
  if (m) return language === "en" ? `Stock: ${m[1]}` : `Stock : ${m[1]}`;
  m = text.match(/^متوفر — (.+) قطعة$/);
  if (m) return language === "en" ? `Available — ${m[1]} items` : `Disponible — ${m[1]} articles`;
  m = text.match(/^(.+) قطعة مباعة$/);
  if (m) return language === "en" ? `${m[1]} items sold` : `${m[1]} articles vendus`;
  m = text.match(/^(.+) قطعة · (.+)$/);
  if (m) return language === "en" ? `${m[1]} items · ${m[2]}` : `${m[1]} articles · ${m[2]}`;
  m = text.match(/^(.+) متبقي$/);
  if (m) return language === "en" ? `${m[1]} remaining` : `${m[1]} restant(s)`;
  m = text.match(/^(.+) يومًا$/);
  if (m) return language === "en" ? `${m[1]} days` : `${m[1]} jours`;
  m = text.match(/^آخر (.+)$/);
  if (m) return language === "en" ? `Last ${m[1]}` : `Dernier ${m[1]}`;
  m = text.match(/^منتجات (.+) قد تعجبك$/);
  if (m) return language === "en" ? `Products you may like` : `Produits susceptibles de vous plaire`;
  return text;
}

export function translateUiText(text: string, language: UiLanguage): string {
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim();

  const direct = byLanguage.get(language)?.get(core);
  if (direct) return leading + direct + trailing;

  const entry = reverse.get(core);
  if (entry) return leading + entry[language === "ar" ? 0 : language === "en" ? 1 : 2] + trailing;

  // Common dynamic labels that contain a number/plan name.
  const dynamic = translateDynamicUiText(core, language);
  if (dynamic !== core) return leading + dynamic + trailing;
  if (language !== "ar") {
    let m = text.match(/^المخزون:\s*(.+)$/);
    if (m) return language === "en" ? `Stock: ${m[1]}` : `Stock : ${m[1]}`;
    m = text.match(/^متوفر\s*—\s*(.+)\s*قطعة$/);
    if (m) return language === "en" ? `Available — ${m[1]} items` : `Disponible — ${m[1]} articles`;
    m = text.match(/^(\d+)\s+عميل$/);
    if (m) return language === "en" ? `${m[1]} customers` : `${m[1]} clients`;
    m = text.match(/^تم تفعيل\s+(.+)\.$/);
    if (m) return language === "en" ? `${m[1]} activated.` : `${m[1]} activé.`;
    m = text.match(/^حالات الطلبات$/);
  }
  return text;
}
