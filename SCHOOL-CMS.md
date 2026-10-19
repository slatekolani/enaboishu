# Enaboishu Secondary School: website and CMS

Public site: Laravel 10 + Inertia + React + Tailwind. Admin panel at `/admin`.

## First run

1. Start **MySQL** from the XAMPP control panel (database `enaboishusec` already exists).
2. In this folder:
   ```bash
   php artisan migrate
   php artisan db:seed      # starter content + admin account
   php artisan serve        # site at http://127.0.0.1:8000
   ```
3. Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then change the password under your profile.

After editing any `resources/js` file run `npm run build`.

## What is editable

| Admin menu | Controls |
| --- | --- |
| Site settings & text | School name, logo, motto, every heading and paragraph on Home / About / Academics / Admissions / other pages, head of school message and photo, contacts, map, social links, footer |
| Hero slides | The home carousel: headline, text, photo, button, order, show/hide |
| Key figures, Testimonials | Numbers strip and quotes on the home page |
| Staff & teachers | Photo, name, position, group, subjects, bio |
| Academic programmes, Facilities, Core values, Downloads | Academics, About and Admissions content, forms and fee documents |
| News, Articles, Events | Each has a cover photo, a multi-photo gallery and a formatted text editor (bold, italic, headings, lists, quotes, links). Events and articles have their own pages. |
| Photo gallery | The Gallery page, with categories |
| Messages | Contact-form submissions |
| Clubs & sports, Student leaders | The Student life page: clubs, societies and teams (patron, meeting time, achievements, photos) and prefects / student council |
| Alumni | Former students. Website sign-ups arrive unapproved; an entry is public only when approved **and** the person agreed. Email and phone are never shown |
| Admission enquiries | Applications from the Apply online page, each with a reference (ENQ-2026-0001). Move them through New → Contacted → Visit booked → Admitted / Not admitted / Withdrawn, keep private notes, export to a spreadsheet |
| Users & roles | Accounts for staff. **Administrator**: everything. **Editor**: news, articles, events, notices, gallery, downloads, clubs and student leaders only |
| Change history | Who changed what, and when (kept for one year) |
| Notice board | Dated announcements in a bar across the top of every page (Information / Important / Urgent). They show between their start and end dates, then hide themselves |
| Academic results | NECTA results per year (CSEE, FTNA, ACSEE): candidates, Divisions I–IV and 0, GPA, ranking. The Results page draws the chart and table; pass rates are calculated automatically |
| Downloads | Documents with type and form (e.g. *Joining instructions · Form I*). The Downloads page has search and filters, shows file type and size, and counts downloads |

The school crest (`public/images/crest.png`) is used as the logo until a replacement is uploaded in Site settings → General. A sharper, higher-resolution scan of the crest will make the masthead and footer look noticeably crisper.

Adding a new editable text or setting: add one line to `config/cms.php`; it appears in the admin automatically.
Sections with no content (staff, testimonials, key figures ...) are hidden from the public site until something is added.

## Uploads

All uploaded photos and documents are saved in `public/uploads/` (organised by type and month), served directly by the web server. Scripts can never run from that folder (`public/uploads/.htaccess`). Back this folder up together with the database.

Formatted text is cleaned with HTML Purifier when it is saved, so only safe formatting is stored.

## Languages (English / Kiswahili)

Visitors switch language with **English | Kiswahili** at the top of every page; the choice is remembered for their visit. The default for new visitors is set in Site settings → General.

- **Site text:** Admin → Site settings & text → **Kiswahili**. Menu labels, buttons and headings already have built-in Kiswahili (`config/cms_sw.php`). Please have them checked by a Kiswahili speaker. Longer paragraphs show in English until they are translated.
- **Content:** every news story, article, event, slide, staff member, programme and so on has an **English | Kiswahili** tab when editing. Anything left untranslated is shown in English.

## Photos and link previews

Uploaded photos are resized (max 2000 px; gallery 1800 px), turned upright, and saved as WebP where the server supports it, otherwise as optimised JPEG. Logos with transparency stay PNG.
Each page sends its own title, description and image to WhatsApp, Facebook and search engines. Set a default preview image in Site settings → General.

## Notifications (SMS and email)

Every form a visitor submits (admission enquiry, contact message, alumni sign-up) triggers:

- **A confirmation to the sender**: an SMS to the phone number they gave and an email to their address, in the language they used on the site (English or Kiswahili). Admission enquiries include the reference number, e.g. ENQ-2026-0001.
- **Alerts to the school**: everyone in **Admin → Notification recipients** (head of school, secretary, admissions officer, administrators, editors…) gets an email and/or SMS, for the kinds of submission they chose.

Edit the wording in **Site settings → Notification messages** (switch to Kiswahili to edit the Kiswahili versions). Check everything in **Admin → Notifications**: SMS balance, test buttons, and a delivery log of every SMS and email with its status.

### Setting up SMS (NextSMS, messaging-service.co.tz)

Put the account details in `.env` (never in the admin panel):

```
NEXTSMS_USERNAME=your-api-username
NEXTSMS_PASSWORD=your-api-password
NEXTSMS_SENDER_ID=ENABOISHU      # the sender ID registered on your NextSMS account
NEXTSMS_TEST_MODE=true           # true = free test endpoint, nothing delivered; set false to go live
```

Then use **Admin → Notifications → Send test**. In test mode NextSMS accepts the message but does not deliver it; set `NEXTSMS_TEST_MODE=false` for real SMS. "Check delivery reports" asks NextSMS which messages reached the phone.

Safety built in: phone numbers like 0712 345 678 are converted to 255712345678; a phone number receives at most 3 confirmation SMS per day (protects your credit if someone abuses a form); names typed by visitors are stripped of links before they go into messages; if the SMS or email service is down, the submission is still saved and the problem appears in the delivery log.

### Setting up email

Put the school's mail account in `.env` on the live server, e.g.:

```
MAIL_MAILER=smtp
MAIL_HOST=mail.your-school-domain.sc.tz
MAIL_PORT=587
MAIL_USERNAME=website@your-school-domain.sc.tz
MAIL_PASSWORD=…
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=website@your-school-domain.sc.tz
MAIL_FROM_NAME="Enaboishu Secondary School"
```

On this computer `MAIL_MAILER=log`: emails are written to `storage/logs/laravel.log` instead of being sent.

### Faster forms (optional)

Notifications are sent just after the visitor's page has loaded, so they never wait. On a busy site you can move them to a background queue: set `QUEUE_CONNECTION=database`, run `php artisan queue:table && php artisan migrate`, and keep `php artisan queue:work` running (or run it every minute from cron with `--stop-when-empty`).

## Social media

Fill in the links under Site settings → Contact & social (Facebook, Instagram, YouTube, TikTok, X, WhatsApp). An icon appears in the top bar and footer for each one.

## Demo content (for previewing the design)

```bash
php artisan demo:seed     # fill every section with invented content and stock photos
php artisan demo:clear    # remove all of it and restore your previous settings exactly
```

Demo items are marked "Demo" in their text, the photos (free Lorem Picsum / Unsplash images) live in `public/uploads/demo/`, and everything the command adds or changes is recorded so `demo:clear` never touches the school's own content. **Always run `php artisan demo:clear` before the site goes live**: the demo includes invented staff, news and examination results.
