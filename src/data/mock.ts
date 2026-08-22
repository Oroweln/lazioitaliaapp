// ─── PLACEHOLDER DATA ────────────────────────────────────────────────────────
// Replace every value marked with TODO before delivering to a client.
// Industries drive the filter chips in DiscoverScreen — keep them consistent
// with the FILTERS array in src/app/(tabs)/discover/index.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export interface Business {
  id: number;
  name: string;
  industry: string;
  description: string;
  size: 'solo' | 'small' | 'medium' | 'large';
  location: string;
  lookingFor: string;
  website?: string;
}

export interface Connection {
  id: number;
  requesterId: number;
  businessId: number;
  status: 'pending_admin' | 'pending_business' | 'approved' | 'rejected';
  message: string;
  business: Business;
  direction: 'sent' | 'received';
  conversationId?: number;
}

export const SIZE_LABELS: Record<string, string> = {
  solo: 'Solo',
  small: '2–10 employees',
  medium: '11–50 employees',
  large: '50+ employees',
};

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  businessId: number;
  businessName: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export const MY_COMPANY_ID = 99;

export const mockBusinesses: Business[] = [
  {
    id: 1,
    name: 'Company Name 1',               // TODO
    industry: 'IT',
    description: 'Short description of what Company Name 1 does, its core services, and the markets it operates in.',  // TODO
    size: 'medium',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 1 is looking for.',  // TODO
    website: 'company1.com',              // TODO
  },
  {
    id: 2,
    name: 'Company Name 2',               // TODO
    industry: 'Logistics',
    description: 'Short description of what Company Name 2 does, its core services, and the markets it operates in.',  // TODO
    size: 'large',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 2 is looking for.',  // TODO
    website: 'company2.com',              // TODO
  },
  {
    id: 3,
    name: 'Company Name 3',               // TODO
    industry: 'Finance',
    description: 'Short description of what Company Name 3 does, its core services, and the markets it operates in.',  // TODO
    size: 'small',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 3 is looking for.',  // TODO
  },
  {
    id: 4,
    name: 'Company Name 4',               // TODO
    industry: 'Manufacturing',
    description: 'Short description of what Company Name 4 does, its core services, and the markets it operates in.',  // TODO
    size: 'large',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 4 is looking for.',  // TODO
  },
  {
    id: 5,
    name: 'Company Name 5',               // TODO
    industry: 'Design',
    description: 'Short description of what Company Name 5 does, its core services, and the markets it operates in.',  // TODO
    size: 'small',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 5 is looking for.',  // TODO
  },
  {
    id: 6,
    name: 'Company Name 6',               // TODO
    industry: 'Agriculture',
    description: 'Short description of what Company Name 6 does, its core services, and the markets it operates in.',  // TODO
    size: 'medium',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 6 is looking for.',  // TODO
  },
  {
    id: 7,
    name: 'Company Name 7',               // TODO
    industry: 'Legal',
    description: 'Short description of what Company Name 7 does, its core services, and the markets it operates in.',  // TODO
    size: 'medium',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 7 is looking for.',  // TODO
  },
  {
    id: 8,
    name: 'Company Name 8',               // TODO
    industry: 'Marketing',
    description: 'Short description of what Company Name 8 does, its core services, and the markets it operates in.',  // TODO
    size: 'small',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 8 is looking for.',  // TODO
  },
  {
    id: 9,
    name: 'Company Name 9',               // TODO
    industry: 'Healthcare',
    description: 'Short description of what Company Name 9 does, its core services, and the markets it operates in.',  // TODO
    size: 'medium',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 9 is looking for.',  // TODO
  },
  {
    id: 10,
    name: 'Company Name 10',              // TODO
    industry: 'Tourism',
    description: 'Short description of what Company Name 10 does, its core services, and the markets it operates in.',  // TODO
    size: 'medium',
    location: 'City, Country',            // TODO
    lookingFor: 'Description of the type of partners or collaborations Company Name 10 is looking for.',  // TODO
  },
];

// The logged-in user's company — shown on the Profile screen.
export const myBusiness: Business = {
  id: MY_COMPANY_ID,
  name: 'My Company',                     // TODO
  industry: 'IT',                         // TODO
  description: 'Short description of what My Company does and what this platform is about.',  // TODO
  size: 'small',
  location: 'City, Country',              // TODO
  lookingFor: 'Description of what My Company is looking for in partners.',  // TODO
  website: 'mycompany.com',               // TODO
};

export const mockConnections: Connection[] = [
  {
    id: 1,
    requesterId: MY_COMPANY_ID,
    businessId: 1,
    status: 'pending_business',
    message: 'Connection request message from My Company to Company Name 1.',  // TODO
    business: mockBusinesses[0],
    direction: 'sent',
  },
  {
    id: 2,
    requesterId: 4,
    businessId: MY_COMPANY_ID,
    status: 'pending_business',
    message: 'Connection request message from Company Name 4 to My Company.',  // TODO
    business: mockBusinesses[3],
    direction: 'received',
  },
  {
    id: 3,
    requesterId: MY_COMPANY_ID,
    businessId: 2,
    status: 'approved',
    message: 'Connection request message from My Company to Company Name 2.',  // TODO
    business: mockBusinesses[1],
    direction: 'sent',
    conversationId: 1,
  },
  {
    id: 4,
    requesterId: 5,
    businessId: MY_COMPANY_ID,
    status: 'approved',
    message: 'Connection request message from Company Name 5 to My Company.',  // TODO
    business: mockBusinesses[4],
    direction: 'received',
    conversationId: 2,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 1,
    businessId: 2,
    businessName: 'Company Name 2',       // TODO — keep in sync with mockBusinesses[1].name
    lastMessage: 'Last message preview text for conversation 1.',  // TODO
    lastMessageAt: '10:42',               // TODO
    unread: 2,
  },
  {
    id: 2,
    businessId: 5,
    businessName: 'Company Name 5',       // TODO — keep in sync with mockBusinesses[4].name
    lastMessage: 'Last message preview text for conversation 2.',  // TODO
    lastMessageAt: 'Yesterday',           // TODO
    unread: 0,
  },
];

export const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1, conversationId: 1, senderId: 2,
      content: 'Opening message from Company Name 2 to My Company.',  // TODO
      createdAt: '09:10',
    },
    {
      id: 2, conversationId: 1, senderId: MY_COMPANY_ID,
      content: 'Reply from My Company.',  // TODO
      createdAt: '09:25',
    },
    {
      id: 3, conversationId: 1, senderId: 2,
      content: 'Follow-up from Company Name 2.',  // TODO
      createdAt: '09:31',
    },
    {
      id: 4, conversationId: 1, senderId: MY_COMPANY_ID,
      content: 'Reply from My Company.',  // TODO
      createdAt: '10:05',
    },
    {
      id: 5, conversationId: 1, senderId: 2,
      content: 'Last message preview text for conversation 1.',  // TODO — keep in sync with mockConversations[0].lastMessage
      createdAt: '10:42',
    },
  ],
  2: [
    {
      id: 1, conversationId: 2, senderId: 5,
      content: 'Opening message from Company Name 5 to My Company.',  // TODO
      createdAt: 'Mon 14:20',
    },
    {
      id: 2, conversationId: 2, senderId: MY_COMPANY_ID,
      content: 'Reply from My Company.',  // TODO
      createdAt: 'Mon 15:00',
    },
    {
      id: 3, conversationId: 2, senderId: 5,
      content: 'Follow-up from Company Name 5.',  // TODO
      createdAt: 'Mon 15:30',
    },
    {
      id: 4, conversationId: 2, senderId: MY_COMPANY_ID,
      content: 'Last message preview text for conversation 2.',  // TODO — keep in sync with mockConversations[1].lastMessage
      createdAt: 'Mon 17:10',
    },
  ],
};
