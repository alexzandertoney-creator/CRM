function daysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}


// Demo data for CRM
window.demoData = {
  companies: [
    {
      id: 1,
      mainContact: "Alice Smith",
      companyName: "Acme Corp",
      email: "contact@acme.com",
      phoneNumber: "1234567890",
      nextStep: "Follow-up call",
      nextActionDate: daysFromToday(0),
      stage: { id: 1, name: "Lead" },
    },
    {
      id: 2,
      mainContact: "Bob Jones",
      companyName: "Globex Inc",
      email: "info@globex.com",
      phoneNumber: "2345678901",
      nextStep: "Send proposal",
      nextActionDate: daysFromToday(1),
      stage: { id: 2, name: "Negotiation" },
    },
    {
      id: 3,
      mainContact: "Carol Lee",
      companyName: "Soylent Corp",
      email: "hello@soylent.com",
      phoneNumber: "3456789012",
      nextStep: "Email follow-up",
      nextActionDate: daysFromToday(2),
      stage: { id: 3, name: "Customer" },
      
    },
    {
    id: 4,
    mainContact: "David Brown",
    companyName: "Initech",
    email: "contact@initech.com",
    phoneNumber: "4567890123",
    nextStep: "Schedule demo",
    nextActionDate: daysFromToday(3),
    stage: { id: 1, name: "Lead" },
  },
  {
    id: 5,
    mainContact: "Emma Wilson",
    companyName: "Umbrella Corp",
    email: "sales@umbrella.com",
    phoneNumber: "5678901234",
    nextStep: "Qualify lead",
    nextActionDate: daysFromToday(4),
    stage: { id: 1, name: "Lead" },
  },
  {
    id: 6,
    mainContact: "Frank Harris",
    companyName: "Hooli",
    email: "info@hooli.com",
    phoneNumber: "6789012345",
    nextStep: "Prepare pricing",
    nextActionDate: daysFromToday(1),
    stage: { id: 2, name: "Negotiation" },
  },
  {
    id: 7,
    mainContact: "Grace Kim",
    companyName: "Vandelay Industries",
    email: "support@vandelay.com",
    phoneNumber: "7890123456",
    nextStep: "Waiting for feedback",
    nextActionDate: daysFromToday(2),
    stage: { id: 2, name: "Negotiation" },
  },
  {
    id: 8,
    mainContact: "Henry Clark",
    companyName: "Stark Industries",
    email: "contact@starkindustries.com",
    phoneNumber: "8901234567",
    nextStep: "Send final proposal",
    nextActionDate: daysFromToday(3),
    stage: { id: 3, name: "Customer" },
  },
  {
    id: 9,
    mainContact: "Isabella Reyes",
    companyName: "Wayne Enterprises",
    email: "hello@wayneenterprises.com",
    phoneNumber: "9012345678",
    nextStep: "Onboarding kickoff",
    nextActionDate: daysFromToday(5),
    stage: { id: 4, name: "Onboarding" },
  },
  {
    id: 10,
    mainContact: "Jack Turner",
    companyName: "Tyrell Corporation",
    email: "support@tyrell.com",
    phoneNumber: "0123456789",
    nextStep: "Quarterly check-in",
    nextActionDate: daysFromToday(4),
    stage: { id: 3, name: "Customer" },
  },
  ],
  stages: [
    { id: 1, name: "Lead" },
    { id: 2, name: "Negotiation" },
    { id: 3, name: "Customer" }
  ],
  contacts: [
    {
      id: 1,
      companyId: 1,
      name: "Sarah Mitchell",
      email: "sarah.mitchell@acmerobotics.com",
      phone: "+1 555-239-8842",
      position: "Head of Procurement"
    },
    {
      id: 2,
      companyId: 2,
      name: "Tom Reynolds",
      email: "tom.reynolds@acmerobotics.com",
      phone: "+1 555-393-1184",
      position: "Lead Engineer"
    },
    {
      id: 3,
      companyId: 2,
      name: "Anika Larsen",
      email: "anika.larsen@nordictech.se",
      phone: "+46 70-442 1122",
      position: "CTO"
    },
    {
      id: 4,
      companyId: 3,
      name: "Piotr Kowalski",
      email: "piotr.k@bluewave.pl",
      phone: "+48 600 112 220",
      position: "Managing Partner"
    }
  ],

  notes: [
    {
      id: 1,
      companyId: 1,
      contactId: 1,
      text: "Initial call went well. They are interested in automation upgrades but have a strict budget.",
      date: "2025-01-14"
    },
    {
      id: 2,
      companyId: 2,
      contactId: 3,
      text: "NordicTech is waiting for Q2 budget approval before moving forward.",
      date: "2025-02-02"
    },
    {
      id: 3,
      companyId: 3,
      contactId: 4,
      text: "Piotr wants a proposal by next Monday. Follow up with projected ROI numbers.",
      date: "2025-01-30"
    }
  ],

  emailTemplates: [
    {
      id: 1,
      name: "Intro Email",
      subject: "Quick Introduction & How We Can Help",
      body: "Hi {{mainContact}} from {{companyName}},\n\nGreat to connect! I wanted to quickly introduce what we do and explore whether it might be valuable for your team.\n\nWould you be open to a short call this week?\n\nBest,\nThe Team at ExampleCorp"
    },
    {
      id: 2,
      name: "Follow-Up Email",
      subject: "Following Up On Our Conversation",
      body: "Hi {{mainContact}} from {{companyName}},\n\nJust following up to see if you had a chance to review the information I sent over. Happy to answer any questions!\n\nBest regards,\nThe Team at ExampleCorp"
    },
    {
      id: 3,
      name: "Proposal Sent",
      subject: "Your Proposal is Ready",
      body: "Hi {{mainContact}} from {{companyName}},\n\nI've attached the proposal for your review. Let me know when you're free to talk through the details.\n\nThanks,\nThe Team at ExampleCorp"
    }
  ]
};
