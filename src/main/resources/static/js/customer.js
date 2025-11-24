document.addEventListener("DOMContentLoaded", async () => {
  // ----- Config -----
  const CUSTOMER_API_URL = "http://localhost:8080/api/customers";
  const NOTE_API_URL = "http://localhost:8080/api/customers";
  const NOTE_ID_API_URL = "http://localhost:8080/api/notes";
  const CONTACT_API_URL = "http://localhost:8080/api/customers";
  const STAGE_API_URL = "http://localhost:8080/api/stages";
  const EMAIL_TEMPLATE_API_URL = "http://localhost:8080/api/email/templates";
  const EMAIL_API_URL = "http://localhost:8080/api/email";

  // ----- State -----
  let customer = {};
  let notes = [];
  let contacts = [];
  let tempRecipients = []; // { email, isMain }

  // ----- DOM references (only after DOMContentLoaded) -----
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get("id");
  console.log("customerId:", customerId); // <-- add this here

if (!customerId) {
  alert("No customer selected!");
  return;
}
  const customerNameEl = document.getElementById("customerName");
  const customerMainContactEl = document.getElementById("customerMainContact");
  const customerEmailEl = document.getElementById("customerEmail");
  const customerPhoneEl = document.getElementById("customerPhoneNumber");
  const nextStepEl = document.getElementById("nextStep");
  const nextActionDateEl = document.getElementById("nextActionDate");
  const stageSelectEl = document.getElementById("stageSelect");

  // Email modal elements (guarded - might be absent on some pages)
  const sendEmailBtn = document.getElementById("sendEmailBtn");
  const emailModal = document.getElementById("emailModal");
  const templateSelect = document.getElementById("templateSelect");
  const emailSubject = document.getElementById("emailSubject");
  const emailBody = document.getElementById("emailBody");
  const cancelEmailBtn = document.getElementById("cancelEmailBtn");
  const confirmSendEmailBtn = document.getElementById("confirmSendEmailBtn");
  const recipientListEl = document.getElementById("recipientList");
  const addRecipientBtn = document.getElementById("addRecipientBtn");

  // other containers
  const contactTable = document.getElementById("contactTable");
  const notesList = document.getElementById("notesList");
  const sentEmailsList = document.getElementById("sentEmailsList");
  const documentList = document.getElementById("documentList");

  if (!customerId) {
    alert("No customer selected!");
    return;
  }

  // ----------------- Helpers -----------------
  function safeElAddEvent(el, ev, handler) {
    if (el) el.addEventListener(ev, handler);
  }

  // ----- Recipient UI -----
  function saveRecipientsToLocalStorage() {
    localStorage.setItem(`recipients_${customerId}`, JSON.stringify(tempRecipients));
  }

  function addRecipientInput(contact = { email: "", isMain: false }, push = true) {
    if (!recipientListEl) return;

    const wrapper = document.createElement("div");
    wrapper.className = "flex gap-2 items-center mb-2";

    const input = document.createElement("input");
    input.type = "email";
    input.className = "recipientInput border rounded w-full p-2";
    input.value = contact.email || "";
    input.placeholder = "Enter recipient email";
    if (contact.isMain) input.readOnly = true;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded";
    removeBtn.textContent = "Remove";

    input.addEventListener("input", () => {
      contact.email = input.value;
      saveRecipientsToLocalStorage();
    });

    removeBtn.addEventListener("click", () => {
      if (contact.isMain && !confirm("Are you sure you want to remove the main contact?")) return;
      tempRecipients = tempRecipients.filter(c => c !== contact);
      wrapper.remove();
      saveRecipientsToLocalStorage();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    recipientListEl.appendChild(wrapper);

    if (push) tempRecipients.push(contact);
  }

  function initializeRecipients() {
    if (!recipientListEl) return;
    recipientListEl.innerHTML = "";
    const saved = localStorage.getItem(`recipients_${customerId}`);
    if (saved) {
      try {
        tempRecipients = JSON.parse(saved) || [];
      } catch (e) {
        tempRecipients = [];
      }
    } else {
      tempRecipients = [];
      if (customer && customer.email) tempRecipients.push({ email: customer.email, isMain: true });
    }
    tempRecipients.forEach(r => addRecipientInput(r, false)); // already in tempRecipients
  }

  // ----------------- Loading functions -----------------
  async function fetchStages(selectedId = null) {
    try {
      const res = await axios.get(STAGE_API_URL);
      const stages = res.data || [];
      if (stageSelectEl) {
        stageSelectEl.innerHTML = stages.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
        if (selectedId) stageSelectEl.value = selectedId;
      }
    } catch (err) {
      console.error("Failed to load stages", err);
    }
  }

  async function loadCustomer() {
    try {
      const res = await axios.get(`${CUSTOMER_API_URL}/${customerId}`);
      customer = res.data || {};
      if (customerNameEl) customerNameEl.innerText = customer.companyName || "Company Name";
      if (customerMainContactEl) customerMainContactEl.innerText = customer.mainContact || "";
      if (customerEmailEl) customerEmailEl.innerText = customer.email || "";
      if (customerPhoneEl) customerPhoneEl.innerText = customer.phoneNumber || "";
      if (nextStepEl) nextStepEl.value = customer.nextStep || "";
      if (nextActionDateEl) nextActionDateEl.value = customer.nextActionDate || "";

      await fetchStages(customer.stage ? customer.stage.id : null);

      initializeRecipients();
    } catch (err) {
      console.error("Failed to load customer", err);
      alert("Failed to load customer info.");
    }
  }

  async function loadContacts() {
  try {
    const res = await axios.get(`${CONTACT_API_URL}/${customerId}/contacts`);
    contacts = res.data || [];
    renderContacts();
  } catch (err) {
    console.error("Failed to load contacts", err);
  }
}


  async function loadNotes() {
    try {
      const res = await axios.get(`${NOTE_API_URL}/${customerId}/notes`);
      notes = (res.data || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      renderNotes();
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  }

  async function loadSentEmails() {
    try {
      const res = await axios.get(`${EMAIL_API_URL}/sent/${customerId}`);
      const emails = res.data || [];
      renderSentEmails(emails);
    } catch (err) {
      console.error("Failed to load sent emails", err);
    }
  }

  async function loadDocuments() {
    if (!documentList) return;
    try {
      const resp = await fetch(`${CUSTOMER_API_URL}/${customerId}/documents`);
      if (!resp.ok) throw new Error("documents fetch failed");
      const documents = await resp.json();
      documentList.innerHTML = "";
      documents.forEach(doc => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center p-2 border-b";
        div.innerHTML = `
          <a href="${CUSTOMER_API_URL}/${customerId}/documents/${encodeURIComponent(doc.name)}/download" target="_blank" class="text-blue-600 hover:underline">${doc.name}</a>
          <div class="flex gap-2">
            <button class="rename-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Rename</button>
            <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
          </div>
        `;
        div.querySelector(".rename-btn").addEventListener("click", async () => {
          const newName = prompt("Enter new file name:", doc.name);
          if (!newName) return;
          const r = await fetch(`${CUSTOMER_API_URL}/${customerId}/documents/${encodeURIComponent(doc.name)}/rename?newName=${encodeURIComponent(newName)}`, { method: "PUT" });
          if (r.ok) { alert("File renamed"); loadDocuments(); } else alert("Rename failed");
        });
        div.querySelector(".delete-btn").addEventListener("click", async () => {
          if (!confirm(`Delete "${doc.name}"?`)) return;
          const r = await fetch(`${CUSTOMER_API_URL}/${customerId}/documents/${encodeURIComponent(doc.name)}`, { method: "DELETE" });
          if (r.ok) { alert("Deleted"); loadDocuments(); } else alert("Delete failed");
        });
        documentList.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }

  // ----------------- Render helpers -----------------
  function renderSentEmails(emails) {
    if (!sentEmailsList) return;
    sentEmailsList.innerHTML = "";
    if (!emails.length) {
      sentEmailsList.innerHTML = `<li class="text-gray-500 py-2">No emails sent yet.</li>`;
      return;
    }
    emails.forEach(e => {
      const recipients = Array.isArray(e.recipients)
        ? e.recipients.join(", ").replace(/, ([^,]*)$/, " and $1")
        : (e.recipients || "Unknown recipient");
      const sentAt = e.sentAt ? dayjs(e.sentAt).format("YYYY-MM-DD HH:mm") : "Unknown date";
      const li = document.createElement("li");
      li.className = "border-b py-2";
      li.innerHTML = `<strong>${e.subject || "(No subject)"}</strong> — sent to ${recipients}<br><small class="text-gray-400">${sentAt}</small>${e.body ? `<p class="text-gray-600 text-sm">${e.body.substring(0,100)}${e.body.length>100?"...":""}</p>` : ""}`;
      sentEmailsList.appendChild(li);
    });
  }

  function renderNotes() {
    if (!notesList) return;
    notesList.innerHTML = "";
    notes.forEach(note => {
      const div = document.createElement("div");
      div.className = "flex justify-between items-center border p-2 rounded bg-gray-50 relative";
      div.innerHTML = `
        <span>${note.text}</span>
        <span class="text-xs text-gray-400">${dayjs(note.timestamp).format('YYYY-MM-DD HH:mm')}</span>
        <div class="relative">
          <button class="noteOptionsBtn text-gray-500 hover:text-gray-700 px-2">⋮</button>
          <div class="noteDropdown hidden absolute right-0 mt-1 bg-white border rounded shadow-lg z-10">
            <button data-id="${note.id}" class="editNoteBtn block px-4 py-2 text-blue-500 hover:bg-gray-100 w-full text-left">Edit</button>
            <button data-id="${note.id}" class="deleteNoteBtn block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left">Delete</button>
          </div>
        </div>
      `;
      notesList.appendChild(div);
    });
  }

  function renderContacts() {
    if (!contactTable) return;
    contactTable.innerHTML = "";
    contacts.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2">${c.name}</td>
        <td class="p-2">${c.email}</td>
        <td class="p-2">${c.phone}</td>
        <td class="p-2">${c.position}</td>
        <td class="p-2 text-center relative">
          <button class="p-2 rounded hover:bg-gray-200 contactMenuBtn">⋮</button>
          <div class="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg hidden z-10">
            <button data-id="${c.id}" class="editBtn block w-full text-left px-2 py-1 hover:bg-gray-100">Edit</button>
            <button data-id="${c.id}" class="deleteBtn block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500">Delete</button>
          </div>
        </td>
      `;
      contactTable.appendChild(row);
    });
  
  }

  // ----------------- CRUD operations -----------------
  async function addNote() {
    const input = document.getElementById("noteInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    await axios.post(`${NOTE_API_URL}/${customerId}/notes`, { text });
    input.value = "";
    await loadNotes();
  }

  async function addContact() {
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const phone = document.getElementById("contactPhoneNumber").value.trim();
    const position = document.getElementById("contactPosition").value.trim();

    if (!name || !email || !phone || !position) {
        alert("Please fill in all contact fields");
        return;
    }

    await axios.post(`http://localhost:8080/api/customers/${customerId}/contacts`, {
        name,
        email,
        phone,
        position
    });
    
    loadContacts();
    // Clear input fields after adding      
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhoneNumber").value = "";
    document.getElementById("contactPosition").value = "";
}


  let contactBeingEdited = null;
  function openEditContactModal(id) {
    const c = contacts.find(x => x.id == id);
    if (!c) return;
    contactBeingEdited = c;
    const modal = document.getElementById("editContactModal");
    if (!modal) return;
    document.getElementById("editContactName").value = c.name || "";
    document.getElementById("editContactEmail").value = c.email || "";
    document.getElementById("editContactPhone").value = c.phone || "";
    document.getElementById("editContactPosition").value = c.position || "";
    modal.classList.remove("hidden");
  }
  function closeEditContactModal() {
    contactBeingEdited = null;
    const modal = document.getElementById("editContactModal");
    if (modal) modal.classList.add("hidden");
  }
  async function saveEditedContact() {
  if (!contactBeingEdited) {
    console.error("No contact is being edited. Did you open the edit modal?");
    alert("Error: No contact selected for editing.");
    return;
  }

  // Get updated values
  const updated = {
    name: document.getElementById("editContactName")?.value.trim() || "",
    email: document.getElementById("editContactEmail")?.value.trim() || "",
    phone: document.getElementById("editContactPhone")?.value.trim() || "",
    position: document.getElementById("editContactPosition")?.value.trim() || ""
  };

  // Validate fields
  if (!updated.name || !updated.email || !updated.phone || !updated.position) {
    alert("Please fill in all fields before saving.");
    return;
  }

  try {
    // Send update to backend
    await axios.put(`http://localhost:8080/api/customers/${customerId}/contacts/${contactBeingEdited.id}`, updated);
    console.log("Contact updated:", updated);

    // Close modal
    const modal = document.getElementById("editContactModal");
    if (modal) modal.classList.add("hidden");
    contactBeingEdited = null;

    // Reload contacts
    await loadContacts();
    alert("Contact saved successfully!");
  } catch (err) {
    console.error("Failed to save contact:", err);
    alert("Failed to save contact. Check console for details.");
  }
}


  async function editNote(id) {
    const note = notes.find(n => n.id == id);
    if (!note) return;
    const newText = prompt("Edit Note:", note.text);
    if (newText === null) return;
    await axios.patch(`${NOTE_ID_API_URL}/${id}`, { text: newText });
    await loadNotes();
  }
  async function deleteNote(id) {
    if (!confirm("Delete this note?")) return;
    await axios.delete(`${NOTE_ID_API_URL}/${id}`);
    await loadNotes();
  }

  async function updateCustomerField(field, value) {
    customer[field] = value;
    try {
      await axios.put(`${CUSTOMER_API_URL}/${customerId}`, customer);
    } catch (err) {
      console.error("Error updating customer:", err);
    }
    await loadCustomer();
  }

  async function updateCustomerStage() {
    customer.stage = { id: parseInt((document.getElementById("stageSelect")||{}).value) };
    try {
      await axios.put(`${CUSTOMER_API_URL}/${customerId}`, customer);
      await loadCustomer();
    } catch (err) { console.error(err); }
  }

  async function deleteCustomer() {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`${CUSTOMER_API_URL}/${customerId}`);
      window.location.href = "index.html";
    } catch (err) { console.error(err); }
  }

  function editCustomer() {
    document.getElementById("editCompanyName").value = customer.companyName || "";
    document.getElementById("editMainContact").value = customer.mainContact || "";
    document.getElementById("editCustomerEmail").value = customer.email || "";
    document.getElementById("editCustomerPhoneNumber").value = customer.phoneNumber || "";
    document.getElementById("editNextStep").value = customer.nextStep || "";
    document.getElementById("editNextActionDate").value = customer.nextActionDate || "";
    axios.get(STAGE_API_URL).then(res => {
      const stages = res.data || [];
      const select = document.getElementById("editStageSelect");
      if (select) {
        select.innerHTML = stages.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
        if (customer.stage) select.value = customer.stage.id;
      }
    });
    const modal = document.getElementById("editCustomerModal");
    if (modal) modal.classList.remove("hidden");
  }
  function closeEditCustomerModal() {
    const modal = document.getElementById("editCustomerModal");
    if (modal) modal.classList.add("hidden");
  }
  async function saveEditedCustomer() {
    const updated = {
      companyName: document.getElementById("editCompanyName").value.trim(),
      mainContact: document.getElementById("editMainContact").value.trim(),
      email: document.getElementById("editCustomerEmail").value.trim(),
      phoneNumber: document.getElementById("editCustomerPhoneNumber").value.trim(),
      nextStep: document.getElementById("editNextStep").value.trim(),
      nextActionDate: document.getElementById("editNextActionDate").value,
      stage: { id: parseInt(document.getElementById("editStageSelect").value) }
    };
    try {
      await axios.put(`${CUSTOMER_API_URL}/${customerId}`, updated);
      closeEditCustomerModal();
      await loadCustomer();
    } catch (err) {
      console.error(err);
      alert("Failed to update customer.");
    }
  }

  // ----------------- Email templates / send -----------------
  async function loadEmailTemplates() {
    if (!templateSelect) return;
    try {
      const res = await axios.get(EMAIL_TEMPLATE_API_URL);
      const templates = res.data || [];
      templateSelect.innerHTML = templates.map(t => `<option value="${t.id}" data-subject="${encodeURIComponent(t.subject||'')}" data-body="${encodeURIComponent(t.body||'')}">${t.name}</option>`).join("");
      if (templates.length > 0) templateSelect.selectedIndex = 0;
      templateSelect.dispatchEvent(new Event("change"));
    } catch (err) {
      console.error("Failed to load email templates", err);
      templateSelect.innerHTML = `<option disabled>Error loading templates</option>`;
    }
  }

  if (templateSelect) {
    templateSelect.addEventListener("change", (e) => {
      const opt = e.target.selectedOptions[0];
      if (!opt) return;
      const subj = decodeURIComponent(opt.getAttribute("data-subject")||"");
      const bodyRaw = decodeURIComponent(opt.getAttribute("data-body")||"");
      const today = new Date().toLocaleDateString('en-GB');
      if (emailSubject) emailSubject.value = subj.replace("{{companyName}}", customer.companyName||"").replace("{{mainContact}}", customer.mainContact||"").replace("{{todaysDate}}", today);
      if (emailBody) emailBody.value = bodyRaw.replace("{{companyName}}", customer.companyName||"").replace("{{mainContact}}", customer.mainContact||"").replace("{{todaysDate}}", today);
    });
  }

  if (sendEmailBtn) {
    safeElAddEvent(sendEmailBtn, "click", () => {
      initializeRecipients();
      loadEmailTemplates();
      if (emailModal) emailModal.classList.remove("hidden");
    });
  }
  safeElAddEvent(cancelEmailBtn, "click", () => { if (emailModal) emailModal.classList.add("hidden"); });

  safeElAddEvent(confirmSendEmailBtn, "click", async () => {
    if (!emailBody || !emailSubject) return;
    const recipients = Array.from(document.querySelectorAll(".recipientInput")).map(i => i.value.trim()).filter(Boolean);
    if (!recipients.length) return alert("Please enter at least one recipient!");
    try {
      await axios.post(`${EMAIL_API_URL}/send/${customerId}`, {
        subject: emailSubject.value,
        body: emailBody.value,
        recipients
      });
      alert("Email recorded successfully!");
      await loadSentEmails();
      initializeRecipients();
      if (emailModal) emailModal.classList.add("hidden");
    } catch (err) {
      console.error("Failed to send email", err);
      alert("Failed to send email.");
    }
  });

  if (addRecipientBtn) safeElAddEvent(addRecipientBtn, "click", () => {
    addRecipientInput({ email: "", isMain: false }, true);
    saveRecipientsToLocalStorage();
  });

  // ----------------- Delegated handlers -----------------
  // ----------------- Contact table delegated click -----------------
if (contactTable) {
  contactTable.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".editBtn");
    const deleteBtn = e.target.closest(".deleteBtn");
    const menuBtn = e.target.closest(".contactMenuBtn");

    // Show dropdown menu
    if (menuBtn) {
      const dropdown = menuBtn.nextElementSibling;
      if (dropdown) dropdown.classList.toggle("hidden");
      return;
    }

    // Edit contact
    if (editBtn) {
      const id = editBtn.dataset.id;
      const contact = contacts.find(c => c.id == id);
      if (!contact) return console.error("Contact not found for edit:", id);
      contactBeingEdited = contact;

      const modal = document.getElementById("editContactModal");
      if (!modal) return console.error("Edit modal not found");
      
      document.getElementById("editContactName").value = contact.name || "";
      document.getElementById("editContactEmail").value = contact.email || "";
      document.getElementById("editContactPhone").value = contact.phone || "";
      document.getElementById("editContactPosition").value = contact.position || "";
      modal.classList.remove("hidden");
      return;
    }

    // Delete contact
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (!id) return console.error("Delete button missing data-id");
      if (!confirm("Delete this contact?")) return;

      try {
        await axios.delete(`${CONTACT_API_URL}/${customerId}/contacts/${id}`);
         await loadContacts(); // refresh table
        console.log("Deleted contact:", id);
      } catch (err) {
        console.error("Failed to delete contact:", err);
        alert("Failed to delete contact");
      }
      return;
    }
  });
}
 
  if (notesList) {
    notesList.addEventListener("click", (e) => {
      const optsBtn = e.target.closest(".noteOptionsBtn");
      if (optsBtn) {
        const dropdown = optsBtn.nextElementSibling;
        if (dropdown) dropdown.classList.toggle("hidden");
        return;
      }
      const editNoteBtn = e.target.closest(".editNoteBtn");
      if (editNoteBtn) return editNote(editNoteBtn.dataset.id);
      const deleteNoteBtn = e.target.closest(".deleteNoteBtn");
      if (deleteNoteBtn) return deleteNote(deleteNoteBtn.dataset.id);
    });
  }

  // Attach top-level static buttons (guarded)
  safeElAddEvent(document.getElementById("addNoteBtn"), "click", addNote);
  safeElAddEvent(document.getElementById("addContactBtn"), "click", addContact);
  safeElAddEvent(document.getElementById("cancelEditContact"), "click", closeEditContactModal);
  safeElAddEvent(document.getElementById("saveEditContact"), "click", saveEditedContact);
  safeElAddEvent(document.getElementById("deleteCustomerBtn"), "click", deleteCustomer);
  safeElAddEvent(document.getElementById("editCustomerBtn"), "click", editCustomer);
  safeElAddEvent(document.getElementById("saveNextStep"), "click", () => updateCustomerField("nextStep", (document.getElementById("nextStep")||{}).value));
  safeElAddEvent(document.getElementById("saveNextActionDate"), "click", () => updateCustomerField("nextActionDate", (document.getElementById("nextActionDate")||{}).value));
  safeElAddEvent(document.getElementById("saveStage"), "click", updateCustomerStage);
  safeElAddEvent(document.getElementById("cancelEditCustomer"), "click", closeEditCustomerModal);
  safeElAddEvent(document.getElementById("saveEditCustomer"), "click", saveEditedCustomer);

  // ----------------- File upload handler (guarded) -----------------
  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("documentFile");
      const file = fileInput?.files?.[0];
      if (!file) return alert("Please choose a file first!");
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${CUSTOMER_API_URL}/${customerId}/documents`, { method: "POST", body: fd });
      if (resp.ok) { (fileInput.value = ""); alert("File uploaded successfully!"); await loadDocuments(); }
      else alert("Upload failed.");
    });
  }

  // ----------------- Init page -----------------
  async function initPage() {
    // load customer first because other things depend on it
    await loadCustomer();
    await Promise.all([loadContacts(), loadNotes(), loadSentEmails(), loadDocuments()]);
  }

  // run init
  initPage().catch(err => console.error("Init failed", err));
});
