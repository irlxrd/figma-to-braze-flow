# Visual Guide: LLM Liquid Tag Suggestions

## Feature Location

The AI suggestion feature is integrated into the **HTML Editor** page, in the **Liquid Tags** panel on the left side.

## UI Components

### 1. AI Suggest Tags Button
```
┌─────────────────────────────────────┐
│  ✨ AI Suggest Tags                 │
│  [Purple gradient button]           │
└─────────────────────────────────────┘
```
- Located at the top of the Liquid Tags panel
- Purple gradient (purple-600 to blue-600)
- Shows loading spinner when getting suggestions

### 2. Suggestions Panel (When Active)
```
┌─────────────────────────────────────────────────┐
│ ✨ AI Suggestions (3)                      [×] │
│ ┌─────────────────────────────────────────────┐ │
│ │ {{first_name}}                    [✓ Add]  │ │
│ │ User's first name                          │ │
│ │ Default: "there"                           │ │
│ │ 📍 In the greeting headline               │ │
│ │ 💡 Personalizes the welcome message       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ {{product_name}}                  [✓ Add]  │ │
│ │ Featured product name                      │ │
│ │ Default: "this product"                    │ │
│ │ 📍 In the main product title              │ │
│ │ 💡 Shows specific product user viewed     │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 3. Active Tags List (After Adding)
```
Active Tags
┌─────────────────────────────────────┐
│ {{first_name}}              [+] [×] │
│ User first name                     │
│ Default: "there"                    │
└─────────────────────────────────────┘
```

## User Flow

```
Step 1: Convert Figma Design
   ↓
Step 2: Click "AI Suggest Tags" button
   ↓
Step 3: Wait 2-5 seconds (shows loading spinner)
   ↓
Step 4: Review AI suggestions in purple panel
   ↓
Step 5: Click "Add" on suggestions you want
   ↓
Step 6: Tag appears in "Active Tags" section
   ↓
Step 7: Use [+] button to insert into HTML
```

## Color Scheme

- **AI Button**: Purple-600 to Blue-600 gradient
- **Suggestions Panel**: Purple-50 to Blue-50 background, Purple-200 border
- **Suggestion Cards**: White background, Purple-200 border
- **Add Button**: Purple-600 background, white text
- **Icons**: Sparkles (✨) for AI features

## States

### Loading State
```
┌─────────────────────────────────────┐
│  ⟳ Getting AI Suggestions...       │
│  [Spinning loader icon]             │
└─────────────────────────────────────┘
```

### Empty State (No Suggestions)
```
No panel shown - button returns to normal state
Toast: "Got 0 suggestions from AI"
```

### Success State
```
Suggestions panel appears with gradient background
Toast: "Got 5 suggestions from AI"
```

### Error State
```
Button returns to normal
Toast: "Failed to get suggestions: [error message]"
```

## Example Screenshots Layout

### Before Clicking
```
┌─────────────────────────────────────┐
│ 💻 Liquid Tags                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ✨ AI Suggest Tags             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Active Tags                         │
│ (Currently empty or has few tags)   │
│                                     │
│ Add New Tag                         │
│ ...                                 │
└─────────────────────────────────────┘
```

### After Clicking (With Suggestions)
```
┌─────────────────────────────────────┐
│ 💻 Liquid Tags                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ✨ AI Suggest Tags             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✨ AI Suggestions (5)          [×] │
│ ┌─────────────────────────────────┐ │
│ │ {{first_name}}        [✓ Add]  │ │
│ │ User's first name              │ │
│ │ Default: "there"               │ │
│ │ 📍 greeting headline           │ │
│ │ 💡 Personalizes greeting       │ │
│ └─────────────────────────────────┘ │
│ ... more suggestions ...            │
│                                     │
│ Active Tags                         │
│ ...                                 │
└─────────────────────────────────────┘
```

### After Adding Suggestions
```
┌─────────────────────────────────────┐
│ 💻 Liquid Tags                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ✨ AI Suggest Tags             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Active Tags                         │
│ ┌─────────────────────────────────┐ │
│ │ {{first_name}}      [+] [×]    │ │
│ │ User's first name              │ │
│ │ Default: "there"               │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ {{product_name}}    [+] [×]    │ │
│ │ Featured product name          │ │
│ │ Default: "this product"        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Add New Tag                         │
│ ...                                 │
└─────────────────────────────────────┘
```

## Interaction Details

### Button Hover
- Slightly darker gradient (purple-700 to blue-700)
- Cursor changes to pointer

### Suggestion Card Hover
- Border changes from purple-200 to purple-400
- Smooth transition

### Add Button Click
- Instant visual feedback
- Card removed from suggestions
- Tag added to active tags
- Success toast appears

## Responsive Behavior

- On large screens: Full sidebar panel
- On medium screens: Scrollable suggestions area (max-height: 16rem)
- On small screens: Collapses naturally with existing responsive layout

## Accessibility

- Button has clear label text
- Loading state communicated visually and via toast
- Keyboard navigable
- Clear focus states
- High contrast colors
