# Broadcast Messaging System - Complete Explanation

## Date: January 18, 2026

---

## 📚 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Step-by-Step Flow](#step-by-step-flow)
4. [Database Structure](#database-structure)
5. [Frontend Components](#frontend-components)
6. [Backend APIs](#backend-apis)
7. [Database Functions](#database-functions)
8. [Message Delivery](#message-delivery)
9. [Read Tracking](#read-tracking)
10. [Complete Example](#complete-example)

---

## 1. Overview

### What is Broadcast Messaging?
Broadcast messaging allows **teachers** to send a single message to **all students in a class** at once, instead of sending individual messages to each student.

### Key Features:
- ✅ Send to entire class with one click
- ✅ Support text messages
- ✅ Support file attachments (images, PDFs, etc.)
- ✅ Track delivery status (how many received)
- ✅ Track read status (how many read)
- ✅ View broadcast history
- ✅ Filter by message category (announcement, urgent, etc.)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TEACHER INTERFACE                         │
│  (Teacher Dashboard → Messages → Broadcast to Class)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  BROADCAST DIALOG                            │
│  - Select Class                                              │
│  - Write Message                                             │
│  - Choose Category                                           │
│  - Attach Files (optional)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React/Next.js)                        │
│  File: app/teacher/dashboard/messages/page.tsx               │
│  Function: handleBroadcast()                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ HTTP POST with FormData
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API                                  │
│  File: app/api/messages/broadcast/route.ts                   │
│  Endpoint: POST /api/messages/broadcast                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MESSAGING SERVICE                               │
│  File: lib/services/messaging-service.ts                     │
│  Function: broadcastToClass()                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           DATABASE FUNCTION (PostgreSQL)                     │
│  Function: send_broadcast_to_class()                         │
│  - Creates broadcast record                                  │
│  - Finds all students in class                               │
│  - Creates individual conversations                          │
│  - Creates messages for each student                         │
│  - Creates recipient tracking records                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│  Tables:                                                     │
│  - broadcast_messages (main broadcast record)                │
│  - broadcast_recipients (per-student tracking)               │
│  - conversations (individual student conversations)          │
│  - messages (actual message content)                         │
│  - message_attachments (file attachments)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              STUDENT INTERFACE                               │
│  - Student sees message in their inbox                       │
│  - Can read message                                          │
│  - Can view attachments                                      │
│  - Read status tracked automatically                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Flow

### Step 1: Teacher Opens Broadcast Dialog
**Location**: Teacher Dashboard → Messages → "Broadcast to Class" button

**What Happens**:
1. Teacher clicks "Broadcast to Class" button
2. Dialog opens showing form with:
   - Class dropdown (fetches teacher's classes from API)
   - Message textarea
   - Category selector
   - File upload area

**Code**:
```tsx
// File: app/teacher/dashboard/messages/page.tsx
<Button onClick={() => setShowBroadcastDialog(true)}>
  <Users className="h-4 w-4 mr-2" />
  Broadcast to Class
</Button>
```

---

### Step 2: Teacher Selects Class
**What Happens**:
1. Dialog fetches classes from `/api/teachers/[teacherId]/classes`
2. Shows only classes assigned to this teacher
3. Displays student count for each class
4. Validates: Cannot select class with 0 students

**API Call**:
```typescript
// File: components/teacher/broadcast-dialog.tsx
const response = await fetch(`/api/teachers/${teacherId}/classes`);
const classes = await response.json();
```

**Validation**:
```typescript
if (selectedClassData && selectedClassData.studentCount === 0) {
  setError("Cannot send broadcast to a class with no students");
  return;
}
```

---

### Step 3: Teacher Writes Message
**What Happens**:
1. Teacher types message (max 2000 characters)
2. Selects category:
   - Announcement
   - Urgent Notice
   - General Information
   - Attendance Related
3. Optionally attaches files (max 100MB per file)

**Character Counter**:
```typescript
const remainingChars = MAX_MESSAGE_LENGTH - content.length;
// Shows: "1850 characters remaining"
```

---

### Step 4: Teacher Sends Broadcast
**What Happens**:
1. Form validates all fields
2. Creates FormData with message and attachments
3. Sends POST request to `/api/messages/broadcast`
4. Shows loading spinner on button

**Frontend Code**:
```typescript
// File: app/teacher/dashboard/messages/page.tsx
const handleBroadcast = async (data) => {
  const formData = new FormData();
  formData.append("classId", data.classId);
  formData.append("content", data.content);
  formData.append("category", data.category);
  
  // Add attachments
  if (data.attachments) {
    data.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await fetch("/api/messages/broadcast", {
    method: "POST",
    body: formData,
  });
  
  const result = await response.json();
  // Shows success toast
}
```

---

### Step 5: Backend Receives Request
**What Happens**:
1. API endpoint receives FormData
2. Validates user session (must be teacher or office)
3. Extracts data: classId, content, category, attachments
4. Calls messaging service

**Backend Code**:
```typescript
// File: app/api/messages/broadcast/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  // Only teachers and office can broadcast
  if (session.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const classId = formData.get('classId');
  const content = formData.get('content');
  const category = formData.get('category');
  const attachments = formData.getAll('attachments');

  const result = await messagingService.broadcastToClass(
    { id: session.id, type: 'teacher', name: session.name },
    classId,
    content,
    category,
    attachments
  );

  return NextResponse.json(result);
}
```

---

### Step 6: Messaging Service Processes Broadcast
**What Happens**:
1. Validates file attachments (if any)
2. Calls database function `send_broadcast_to_class`
3. Uploads attachments to storage
4. Returns delivery statistics

**Service Code**:
```typescript
// File: lib/services/messaging-service.ts
async broadcastToClass(sender, classId, content, category, attachments) {
  // Validate attachments
  if (attachments) {
    for (const file of attachments) {
      const validation = isFileAllowed(sender.type, file);
      if (!validation.allowed) {
        throw new Error('File type not allowed');
      }
    }
  }

  // Call database function
  const { data, error } = await supabase.rpc('send_broadcast_to_class', {
    p_sender_id: sender.id,
    p_sender_type: sender.type,
    p_sender_name: sender.name,
    p_class_id: classId,
    p_content: content,
    p_category: category,
  });

  const broadcastId = data;

  // Upload attachments for each message
  if (attachments && broadcastId) {
    // Get all messages created by this broadcast
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('broadcast_id', broadcastId);

    // Upload attachments for each message
    for (const message of messages) {
      for (const file of attachments) {
        await this.uploadAttachment(message.id, file, sender);
      }
    }
  }

  return {
    broadcastId,
    totalRecipients: stats.total_recipients,
    deliveredCount: stats.delivered_count,
  };
}
```

---

### Step 7: Database Function Creates Records
**What Happens** (Inside PostgreSQL function):

1. **Create Broadcast Record**:
```sql
INSERT INTO broadcast_messages (
  sender_id, sender_type, sender_name,
  class_id, class_name, content, category
) VALUES (...) RETURNING id;
```

2. **Find All Students in Class**:
```sql
SELECT id, CONCAT(first_name, ' ', last_name) as name
FROM students
WHERE class_section LIKE '%' || class_name || '%';
```

3. **For Each Student**:
   - Create or find conversation between teacher and student
   - Insert message into conversation
   - Create recipient tracking record

4. **Update Statistics**:
```sql
UPDATE broadcast_messages
SET total_recipients = student_count,
    delivered_count = student_count
WHERE id = broadcast_id;
```

---

### Step 8: Success Response
**What Happens**:
1. Database function returns broadcast ID
2. Service returns statistics
3. API sends response to frontend
4. Frontend shows success toast
5. Dialog closes
6. Broadcast history refreshes

**Success Toast**:
```
✅ Broadcast sent successfully
Message delivered to 3 of 3 students
```

---

## 4. Database Structure

### Table: `broadcast_messages`
**Purpose**: Main record of each broadcast

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Unique broadcast ID |
| sender_id | text | Teacher's ID |
| sender_type | varchar | 'TEACHER' or 'OFFICE' |
| sender_name | varchar | Teacher's full name |
| class_id | text | Class UUID |
| class_name | varchar | Class name (e.g., "MATH-101-A") |
| content | text | Message content |
| category | varchar | Message category |
| total_recipients | int | Total students in class |
| delivered_count | int | How many received |
| read_count | int | How many read (updated later) |
| created_at | timestamptz | When sent |

**Example Row**:
```json
{
  "id": "57f8eda1-775a-483d-a16a-366927362c8f",
  "sender_name": "مسعود اندیوال",
  "class_name": "MATH-101-A",
  "content": "please send me you 3x4 photo and your ID card.",
  "category": "urgent",
  "total_recipients": 3,
  "delivered_count": 3,
  "read_count": 0
}
```

---

### Table: `broadcast_recipients`
**Purpose**: Track delivery and read status per student

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Unique recipient record ID |
| broadcast_id | text (FK) | Links to broadcast_messages |
| student_id | text | Student's ID |
| student_name | varchar | Student's full name |
| message_id | text (FK) | Links to messages table |
| delivered_at | timestamptz | When delivered |
| read_at | timestamptz | When read (NULL if unread) |

**Example Rows**:
```json
[
  {
    "broadcast_id": "57f8eda1-775a-483d-a16a-366927362c8f",
    "student_id": "10101",
    "student_name": "Mike Taylor",
    "delivered_at": "2026-01-18 08:02:08",
    "read_at": null  // Not read yet
  },
  {
    "broadcast_id": "57f8eda1-775a-483d-a16a-366927362c8f",
    "student_id": "10102",
    "student_name": "Kate Anderson",
    "delivered_at": "2026-01-18 08:02:08",
    "read_at": "2026-01-18 09:15:23"  // Read!
  }
]
```

---

### Table: `conversations`
**Purpose**: Individual conversation between teacher and each student

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Conversation ID |
| conversation_type | varchar | 'direct', 'group', or 'broadcast' |
| class_id | text | Class ID (for broadcasts) |
| group_name | varchar | Class name (for broadcasts) |
| last_message_at | timestamptz | Last message time |
| last_message_preview | text | Preview of last message |

**Note**: Currently broadcast conversations are marked as 'direct' type (this is the issue causing student names to show instead of class names).

---

### Table: `messages`
**Purpose**: Actual message content

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Message ID |
| conversation_id | text (FK) | Links to conversation |
| sender_id | text | Teacher's ID |
| sender_type | varchar | 'TEACHER' |
| sender_name | varchar | Teacher's name |
| content | text | Message text |
| category | varchar | Message category |
| created_at | timestamptz | When sent |

---

### Table: `message_attachments`
**Purpose**: File attachments

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Attachment ID |
| message_id | text (FK) | Links to message |
| filename | varchar | File name |
| file_type | varchar | MIME type |
| file_size | int | Size in bytes |
| file_url | text | Storage URL |
| storage_path | text | Path in storage |

---

## 5. Frontend Components

### Component: `BroadcastDialog`
**File**: `components/teacher/broadcast-dialog.tsx`

**Purpose**: UI for creating and sending broadcasts

**Features**:
- Class selection dropdown
- Message textarea with character counter
- Category selector
- File upload with drag & drop
- Attachment previews
- Validation
- Loading states
- Error handling

**Key Functions**:
```typescript
// Fetch teacher's classes
const fetchClasses = async () => {
  const response = await fetch(`/api/teachers/${teacherId}/classes`);
  const data = await response.json();
  setClasses(data);
}

// Handle file selection
const handleFileSelect = (files) => {
  // Validate file size and type
  // Create previews for images
  // Add to attachments array
}

// Send broadcast
const handleSend = async () => {
  // Validate form
  // Call onSend callback
  // Reset form on success
}
```

---

### Component: `BroadcastHistory`
**File**: `components/teacher/broadcast-history.tsx`

**Purpose**: Display list of sent broadcasts with statistics

**Features**:
- Shows all sent broadcasts
- Displays class names
- Shows delivery statistics
- Shows read statistics
- Progress bars for read percentage
- Refresh button
- Loading states
- Empty states

**Data Fetching**:
```typescript
// Hook: hooks/use-broadcast-history.ts
const { data: broadcasts, isLoading, error, refetch } = useBroadcastHistory();

// API: app/api/messages/broadcast/history/route.ts
GET /api/messages/broadcast/history
```

---

## 6. Backend APIs

### API: POST /api/messages/broadcast
**File**: `app/api/messages/broadcast/route.ts`

**Purpose**: Send broadcast message

**Request**:
```typescript
FormData {
  classId: string,
  content: string,
  category: string,
  attachments: File[] (optional)
}
```

**Response**:
```json
{
  "broadcastId": "uuid",
  "totalRecipients": 3,
  "deliveredCount": 3
}
```

**Authentication**: Requires teacher or office session

---

### API: GET /api/messages/broadcast/history
**File**: `app/api/messages/broadcast/history/route.ts`

**Purpose**: Get broadcast history for current teacher

**Response**:
```json
{
  "broadcasts": [
    {
      "id": "uuid",
      "className": "MATH-101-A",
      "content": "Message text",
      "category": "urgent",
      "totalRecipients": 3,
      "deliveredCount": 3,
      "readCount": 1,
      "createdAt": "2026-01-18T08:02:08Z"
    }
  ]
}
```

**Authentication**: Requires teacher or office session

---

### API: GET /api/teachers/[id]/classes
**File**: `app/api/teachers/[id]/classes/route.ts`

**Purpose**: Get classes assigned to teacher

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "MATH-101-A",
    "session": "MORNING",
    "major": "Mathematics",
    "semester": 1,
    "studentCount": 3
  }
]
```

---

## 7. Database Functions

### Function: `send_broadcast_to_class()`
**Purpose**: PostgreSQL function that handles all broadcast logic

**Parameters**:
- `p_sender_id`: Teacher's ID
- `p_sender_type`: 'TEACHER' or 'OFFICE'
- `p_sender_name`: Teacher's full name
- `p_class_id`: Class UUID
- `p_content`: Message text
- `p_category`: Message category

**What It Does**:
1. Creates broadcast record in `broadcast_messages`
2. Finds all students in the class
3. For each student:
   - Creates/finds conversation
   - Inserts message
   - Creates recipient record
4. Updates broadcast statistics
5. Returns broadcast ID

**Pseudo-code**:
```sql
CREATE OR REPLACE FUNCTION send_broadcast_to_class(...)
RETURNS TEXT AS $$
DECLARE
  v_broadcast_id TEXT;
  v_student RECORD;
  v_conversation_id TEXT;
  v_message_id TEXT;
BEGIN
  -- Create broadcast record
  INSERT INTO broadcast_messages (...) RETURNING id INTO v_broadcast_id;
  
  -- Find all students in class
  FOR v_student IN 
    SELECT * FROM students WHERE class_section LIKE '%' || class_name || '%'
  LOOP
    -- Create/find conversation
    -- Insert message
    -- Create recipient record
  END LOOP;
  
  -- Update statistics
  UPDATE broadcast_messages SET total_recipients = ..., delivered_count = ...;
  
  RETURN v_broadcast_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Message Delivery

### How Messages Reach Students

**Step 1: Database Records Created**
- Broadcast function creates individual message for each student
- Each message linked to a conversation
- Each conversation has the student as participant

**Step 2: Student Logs In**
- Student dashboard fetches conversations
- API: `GET /api/conversations`
- Returns all conversations where student is participant

**Step 3: Student Sees Message**
- Message appears in student's inbox
- Shows sender name (teacher)
- Shows message preview
- Shows timestamp
- Shows unread badge if not read

**Step 4: Student Opens Message**
- Full message content displayed
- Attachments shown (if any)
- Read status updated automatically

---

## 9. Read Tracking

### How Read Status is Tracked

**When Student Opens Message**:
1. Frontend calls API to mark message as read
2. API updates `broadcast_recipients` table:
   ```sql
   UPDATE broadcast_recipients
   SET read_at = NOW()
   WHERE broadcast_id = ? AND student_id = ?
   ```
3. Broadcast history shows updated read count

**Calculating Read Count**:
```sql
SELECT COUNT(*) 
FROM broadcast_recipients
WHERE broadcast_id = ? AND read_at IS NOT NULL
```

**Read Percentage**:
```typescript
const readPercentage = (readCount / totalRecipients) * 100;
// Example: (1 / 3) * 100 = 33%
```

---

## 10. Complete Example

### Scenario: Teacher Sends Urgent Message to MATH-101-A

**Step-by-Step**:

1. **Teacher Action**:
   - Opens Messages page
   - Clicks "Broadcast to Class"
   - Selects "MATH-101-A" (3 students)
   - Types: "please send me you 3x4 photo and your ID card."
   - Selects category: "Urgent"
   - Clicks "Send Broadcast"

2. **Frontend Processing**:
   ```typescript
   handleBroadcast({
     classId: "uuid-of-math-101-a",
     className: "MATH-101-A",
     content: "please send me you 3x4 photo and your ID card.",
     category: "urgent",
     attachments: []
   })
   ```

3. **API Call**:
   ```
   POST /api/messages/broadcast
   Body: FormData with classId, content, category
   ```

4. **Database Function Executes**:
   - Creates broadcast record (ID: `57f8eda1-775a-483d-a16a-366927362c8f`)
   - Finds 3 students: Mike Taylor, Kate Anderson, Jack Thomas
   - Creates 3 conversations (teacher ↔ each student)
   - Creates 3 messages (one in each conversation)
   - Creates 3 recipient records

5. **Database State**:
   ```
   broadcast_messages:
   - id: 57f8eda1...
   - class_name: MATH-101-A
   - content: please send me...
   - total_recipients: 3
   - delivered_count: 3
   - read_count: 0
   
   broadcast_recipients:
   - Mike Taylor: delivered, not read
   - Kate Anderson: delivered, not read
   - Jack Thomas: delivered, not read
   
   conversations: 3 conversations created
   messages: 3 messages created
   ```

6. **Success Response**:
   ```json
   {
     "broadcastId": "57f8eda1-775a-483d-a16a-366927362c8f",
     "totalRecipients": 3,
     "deliveredCount": 3
   }
   ```

7. **Frontend Shows**:
   ```
   ✅ Broadcast sent successfully
   Message delivered to 3 of 3 students
   ```

8. **Students See Message**:
   - Mike logs in → sees message in inbox
   - Kate logs in → sees message in inbox
   - Jack logs in → sees message in inbox

9. **Kate Opens Message**:
   - Message marked as read
   - `broadcast_recipients` updated: `read_at = NOW()`
   - Broadcast history now shows: "Read: 1 (33%)"

10. **Teacher Views History**:
    - Opens "Broadcast History" tab
    - Sees broadcast with:
      - Class: MATH-101-A
      - Recipients: 3
      - Delivered: 3
      - Read: 1 (33%)
      - Progress bar: 33% filled

---

## Summary

### Key Points:

1. **One-to-Many**: One broadcast creates multiple individual messages
2. **Database-Driven**: PostgreSQL function handles all logic
3. **Tracked**: Every delivery and read is tracked
4. **Flexible**: Supports text, files, categories
5. **Efficient**: Single API call sends to entire class
6. **Transparent**: Teacher sees exactly who received and read

### Data Flow:
```
Teacher → Dialog → API → Service → DB Function → Database
                                                      ↓
Student ← Inbox ← API ← Conversations ← Messages ← Database
```

### Tables Involved:
1. `broadcast_messages` - Main broadcast record
2. `broadcast_recipients` - Per-student tracking
3. `conversations` - Individual conversations
4. `messages` - Actual message content
5. `message_attachments` - File attachments

---

This is the complete broadcast messaging system! 🎉
