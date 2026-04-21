# Society Khata Architecture (Master Reference)

## 1. PRODUCT VISION & CONSTRAINTS

**The Antigravity Philosophy:**
"Society Khata" embodies a zero-latency, offline-first engineering philosophy designed to completely hide complexity from the user. Interactions invoke immediate, optimistic UI updates, ensuring that users never experience blocking states or loading spinners during core ledger functions. The data layer silently resolves in the background, offering flawless continuous usage even in absolutely network-deprived environments.

**Strict Core Tech Stack:**
- **Framework:** React Native 0.73+ (via Expo SDK 50+ managed workflow)
- **Language:** TypeScript (Strict Mode; absolutely no `any` types)
- **State Management:** Zustand (for lightweight, monolithic global state)
- **Offline Data Layer:** `expo-sqlite` (Synchronous implementation)
- **Data Entry / Validation:** `react-hook-form` + `zod`
- **Native PDF Engine:** `expo-print` + `expo-sharing` (compatible with Expo Go)

**Architectural Rules:**
- 🚫 **No Heavy Libraries:** Do NOT introduce heavyweight UI suites like NativeBase or UI Kitten. Stick to pure React Native StyleSheet and specialized primitives.
- 🚫 **No External State Providers:** Do NOT introduce Redux, MobX, or Context APIs for broad app state. Stick strictly to Zustand slices.
- ⚡ **Synchronous First:** Leverage `expo-sqlite`'s `runSync` and `getAllSync` wherever safe to bypass standard asynchronous bridge overhead.

---

## 2. DATABASE SCHEMA (SQLite - The Core)

The application relies completely on a local SQLite database, establishing a rigorous offline-first data flow strategy. Data is loaded into the Zustand store on app startup, and all UI modifications write directly to Zustand *before* emitting an asynchronous background SQLite query to persist the data.

### Schema Blueprint

| Table | Column | Type | Constraints |
| :--- | :--- | :--- | :--- |
| **`societies`** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| | `name` | TEXT | NOT NULL |
| | `default_amount` | REAL | NOT NULL |
| | `created_at` | TEXT | NOT NULL |
| **`members`** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| | `society_id` | INTEGER | NOT NULL, FOREIGN KEY (societies.id) |
| | `name` | TEXT | NOT NULL |
| | `flat_number` | TEXT | NOT NULL |
| | `phone` | TEXT | NOT NULL |
| | `is_paid` | INTEGER | DEFAULT 0 (Boolean representation) |
| **`payments`** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| | `member_id` | INTEGER | NOT NULL, FOREIGN KEY (members.id) |
| | `amount` | REAL | NOT NULL |
| | `mode` | TEXT | NOT NULL (e.g., 'UPI', 'CASH') |
| | `timestamp` | TEXT | NOT NULL |

---

## 3. STATE MANAGEMENT (Zustand)

State is managed by a centralized, tightly-coupled Zustand hook implementation to handle high-performance updates without prop-drilling.

- **`useSocietyStore`**: Manages the current active society context, bootstrapping properties like `default_amount` and society ID from local persistence.
- **`useMemberStore`**: Houses the loaded array of `Member[]`. Capable of highly optimized optimistic updates (e.g., temporarily injecting a member with a pseudo-ID while the background SQlite completes).
- **`usePaymentStore`**: Handles the ledger metrics tracking (`totalCollected`, `totalPending`). Exposes `markPaidOptimistic` actions which aggressively recompute sums instantly upon invocation while resolving the raw inserts to the `payments` table gracefully behind the scenes.

*(Note: In implementation, these are merged into a single robust slice inside `useStore.ts` for simplified context retrieval).*

---

## 4. DIRECTORY STRUCTURE

To guarantee scalability and strict separation of concerns, the directory relies on a modernized Domain-Driven Design tailored for Expo:

```text
src/
├── core/
│   ├── design/        # theme.ts (Colors, Typography constants)
│   ├── database/      # DatabaseService.ts (SQLite schemas and CRUD)
│   ├── store/         # useStore.ts (Zustand global controllers)
│   ├── types/         # index.ts (Strict Zod and TS definitions)
│   └── utils/         # whatsappHook.ts, pdfService.ts
├── features/
│   ├── onboarding/    # Setup sequences and intro splash
│   ├── dashboard/
│   │   ├── components/ # Local components (Modals, MemberItem)
│   │   └── DashboardScreen.tsx
└── App.tsx            # Application entry, providers, and initialization
```

---

## 5. CORE MVP FEATURES (The Basic Scope)

### Onboarding Flow (Zero Friction)
- **Objective:** < 30 seconds to interaction.
- **Flow:** Fluid Splash -> Input "Society Name" (e.g., *Gokuldham Society*) + define default monthly maintenance amount -> Quick bootstrap with dummy members (or Skip directly to Dashboard).

### Main Dashboard (Command Center)
- **Header:** Prominent display of the Society Name and current registered member count.
- **Metrics Calculation:** Top-level horizontal scrolling cards reflecting `Total Collected (₹)`, `Pending (₹)`, and overall `Paid Completion (%)`.
- **Donut Chart Logic:** Aggregates `paidCount / totalMembers` filling an animated graphic strictly corresponding to the live Zustand state.

### Member Ledger (High-Performance List)
- **Implementation:** Leverages heavily memoized `<FlatList>` components capable of retaining 60fps scrolling under loads of hundreds of members.
- **Gestures:** Wrapped in `react-native-gesture-handler` `Swipeable`. 
  - *Swipe Right:* Fires the optimistic "Mark Paid" trigger.
  - *Swipe Left:* Invokes the deep-linked `shareWhatsAppReminder` broadcast logic.

### Payment Logging
- **Forms:** Overlaying modal interfaces (`react-hook-form` validation bypassing heavy navigation transitions). Contains Member Selector, Amount, and Mode (Cash/UPI) definitions.
- **Micro-Interaction:** On success, visual haptics or confetti indicate completion, instilling a premium dynamic feel.

### PDF Generation Engine & Growth Loop
- **Engine:** Employs `expo-print` to translate raw HTML layout blocks into styled PDF tables dynamically mapping `member` arrays.
- **Output Elements:** Header society branding, aggregate stats, and the strict ledger list differentiating `PAID` from `PENDING`.
- **Growth Loop (The Viral Hook):** PDF Footers and the default WhatsApp deep-links are strictly encoded with: *"Generated via Society Khata 📱 | Community Finance, Simplified."*

---

## 6. DESIGN SYSTEM (CSS Variables)

A unified aesthetic evoking "Bank-grade security meets neighborhood warmth."

**Color Palette:**
- `--color-primary`: `#1B4F72` *(Deep Trust Blue)*
- `--color-accent`: `#FF6F3C` *(Vibrant Saffron)*
- `--color-success`: `#27AE60` *(Fresh Green)*
- `--color-warning`: `#F39C12` *(Amber)*
- `--color-danger`: `#E74C3C` *(Red)*
- `--color-bg-primary`: `#F8F9FA` *(Soft off-white canvas)*
- `--color-bg-secondary`: `#FFFFFF` *(Pure white elevation elements)*
- `--color-text-primary`: `#2C3E50` *(Dark slate for high legibility)*
- `--color-text-secondary`: `#7F8C8D` *(Medium gray for subtitles)*

**Typography Logic:**
- **Headers:** `System` (mapped to native Bold / Weight 700 - mimicking Poppins aesthetics).
- **Body Text:** `System` (mapped to native Regular / Weight 400 - mimicking Inter).
- **Numbers & Currencies:** Strict monospaced layout implementations or heavy `600`/`700` weights (mimicking JetBrains Mono) explicitly for un-shifting financial clarity.
- **Elevation:** Diffused drop shadows `0px 4px 12px rgba(0,0,0,0.05)` yielding clean, layered float aesthetics.
