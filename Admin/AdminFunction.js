// --- DATABASE CATALOGUE SYNC ENGINE (LOCALSTORAGE) ---
let databaseMenu = JSON.parse(localStorage.getItem('databaseMenu')) || [
    { id: 1, cafe: "Midnight Café", type: "drinks", name: "Midnight Latte", price: 120, stock: 10 },
    { id: 2, cafe: "Midnight Café", type: "drinks", name: "Dark Espresso", price: 100, stock: 5 },
    { id: 3, cafe: "Midnight Café", type: "drinks", name: "Chocolate Cake", price: 110, stock: 2 },
    { id: 4, cafe: "Rainy Café", type: "drinks", name: "Drizzle Brew Blend", price: 130, stock: 12 },
    { id: 5, cafe: "Rainy Café", type: "desserts", name: "Warm Glazed Cookies", price: 80, stock: 0 },
    { id: 6, cafe: "Gamer Café", type: "drinks", name: "Overclock Energy Overload", price: 140, stock: 20 }
];

// RUN REGISTRY DISPLAY UPON INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    buildAdminInventoryDOM();
});

// BUILD GLOBAL INVENTORY MANAGEMENT INTERFACE
function buildAdminInventoryDOM() {
    const listContainer = document.getElementById('admin-live-inventory-list');
    if (!listContainer) return; 
    
    listContainer.innerHTML = "";

    if (databaseMenu.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted); padding:16px;">Global product catalogue registry database completely empty.</p>`;
        return;
    }

    databaseMenu.forEach(item => {
        listContainer.innerHTML += `
            <div class="admin-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.02); border-radius:8px;">
                <div style="max-width:50%;">
                    <div style="font-size:0.9rem; font-weight:600; color:white;">${item.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${item.cafe} | ₱${item.price}</div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:0.8rem; color:var(--text-muted);">Qty:</span>
                    <input type="number" id="stock-input-${item.id}" value="${item.stock}" style="width:50px; padding:4px; font-size:0.8rem; text-align:center; background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); color:white; border-radius:4px;">
                    
                    <button class="btn-primary" style="padding: 4px 8px; font-size: 0.75rem; cursor:pointer; width: auto; background: #c5a880; color: #131110; border: none; border-radius: 4px; font-weight: 600;" onclick="updateStockLevel(${item.id})">
                        Apply
                    </button>
                    
                    <button class="btn-danger" style="cursor:pointer; padding: 4px 8px; font-size: 0.75rem;" onclick="removeProductRegistry(${item.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
}

// UPLOAD NEW PRODUCT AND SYNC MATRIX
function addNewProductRegistry() {
    const cafe = document.getElementById('admin-new-cafe').value;
    const name = document.getElementById('admin-new-name').value.trim();
    const type = document.getElementById('admin-new-type').value;
    const price = parseInt(document.getElementById('admin-new-price').value);
    const stock = parseInt(document.getElementById('admin-new-stock').value);

    if (name === "" || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        showAdminAlert("Input Error", "Please fill up all the product details correctly with valid positive numbers.", false);
        return;
    }

    const newId = databaseMenu.length > 0 ? Math.max(...databaseMenu.map(i => i.id)) + 1 : 1;
    
    databaseMenu.push({
        id: newId,
        cafe: cafe,
        type: type,
        name: name,
        price: price,
        stock: stock
    });

    localStorage.setItem('databaseMenu', JSON.stringify(databaseMenu));

    showAdminAlert("Product Uploaded", `"${name}" successfully uploaded to ${cafe}!`, true);
    
    // Clear Input Fields
    document.getElementById('admin-new-name').value = "";
    document.getElementById('admin-new-price').value = "";
    document.getElementById('admin-new-stock').value = "";

    buildAdminInventoryDOM();
}

// UPDATE LIVE PRODUCT UNIT COUNT (MANUAL APPLY RESTOCKING CONTROLLER)
function updateStockLevel(id) {
    const inputElement = document.getElementById(`stock-input-${id}`);
    if (!inputElement) return;

    const parsedCount = parseInt(inputElement.value);
    const targetProduct = databaseMenu.find(item => item.id === id);
    
    if (targetProduct && !isNaN(parsedCount) && parsedCount >= 0) {
        targetProduct.stock = parsedCount;
        
        localStorage.setItem('databaseMenu', JSON.stringify(databaseMenu));
        
        showAdminAlert("Stock Updated", `"${targetProduct.name}" stock level successfully updated to ${parsedCount}!`, true);
        
        buildAdminInventoryDOM();
    } else {
        showAdminAlert("Execution Error", "Please enter a valid positive stock number value.", false);
    }
}

// REMOVE RECORD ELEMENT FROM DATABASE CATALOG (CUSTOM CONFIRMATION POPUP)
function removeProductRegistry(id) {
    const targetProduct = databaseMenu.find(item => item.id === id);
    const productName = targetProduct ? targetProduct.name : "this item";

    showAdminAlert(
        "Delete Product?", 
        `Are you sure you want to permanently remove "${productName}" from the system tracking registry?`, 
        false, 
        true, 
        () => {
            databaseMenu = databaseMenu.filter(item => item.id !== id);
            localStorage.setItem('databaseMenu', JSON.stringify(databaseMenu));
            buildAdminInventoryDOM();
        }
    );
}

// SYSTEM EXIT ROUTING CONTROLLER
function logoutAdmin() {
    showAdminAlert(
        "Exit Matrix?", 
        "Are you sure you want to exit the system management console window?", 
        true, 
        true, 
        () => {
            window.location.href = "../index.html"; 
        }
    );
}

// --- REUSABLE MODERN DESIGN SYSTEM ALERT WITH GLASSMORPHISM & ACCENT ANIMATION ---
function showAdminAlert(title, message, isSuccess = false, isConfirm = false, confirmCallback = null) {
    const existingModal = document.getElementById('admin-custom-modal');
    if (existingModal) existingModal.remove();

    const icon = isSuccess ? "✨" : "⚠️";
    const accentColor = isSuccess ? "var(--accent-glow, #c5a880)" : "#ff4a4a";

    let buttonMarkup = `
        <button id="admin-modal-ok-btn" style="
            background: linear-gradient(135deg, #5c2323, #3a1515);
            color: #ffb3b3;
            border: 1px solid rgba(255, 0, 0, 0.2);
            padding: 12px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            font-family: sans-serif;
            box-shadow: 0 4px 15px rgba(92, 35, 35, 0.4);
            transition: all 0.2s ease;
        ">Dismiss</button>
    `;

    if (isConfirm) {
        buttonMarkup = `
            <div style="display: flex; gap: 10px;">
                <button id="admin-modal-cancel-btn" style="
                    background: rgba(41, 37, 36, 0.6);
                    color: #a8a29e;
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 50%;
                    font-family: sans-serif;
                ">Cancel</button>
                <button id="admin-modal-confirm-btn" style="
                    background: linear-gradient(135deg, #5c2323, #3a1515);
                    color: #ffb3b3;
                    border: 1px solid rgba(255, 0, 0, 0.2);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 50%;
                    font-family: sans-serif;
                    box-shadow: 0 4px 15px rgba(92, 35, 35, 0.4);
                ">Proceed</button>
            </div>
        `;
    }

    // GHOSTMORPHISM BASE LAYER WITH FROSTED BLUR EFFECT
    const modalHTML = `
        <div id="admin-custom-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(10, 8, 7, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(12px) saturate(160%);
            -webkit-backdrop-filter: blur(12px) saturate(160%);
            opacity: 0;
            transition: opacity 0.25s ease-in-out;
        ">
            <div style="
                background: rgba(28, 25, 23, 0.75);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-top: 4px solid ${accentColor};
                border-radius: 16px;
                padding: 28px 24px;
                width: 85%;
                max-width: 340px;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1);
                transform: translateY(20px) scale(0.95);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <div style="
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 100px;
                    height: 100px;
                    background: ${accentColor};
                    filter: blur(45px);
                    opacity: 0.25;
                    pointer-events: none;
                "></div>

                <div style="font-size: 2.8rem; margin-bottom: 14px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
                    ${icon}
                </div>
                
                <h3 style="color: #f5f5f4; font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; font-family: sans-serif; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                    ${title}
                </h3>
                
                <p style="color: #b4ad9e; font-size: 0.88rem; margin-bottom: 24px; font-family: sans-serif; line-height: 1.5;">
                    ${message}
                </p>
                
                ${buttonMarkup}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('admin-custom-modal');
    const content = overlay.children[0];

    // Trigger Entry Transition Animation
    setTimeout(() => {
        overlay.style.opacity = "1";
        content.style.transform = "translateY(0) scale(1)";
    }, 15);

    const closeModal = () => {
        overlay.style.opacity = "0";
        content.style.transform = "translateY(15px) scale(0.95)";
        setTimeout(() => overlay.remove(), 250);
    };

    if (isConfirm) {
        document.getElementById('admin-modal-cancel-btn').addEventListener('click', closeModal);
        document.getElementById('admin-modal-confirm-btn').addEventListener('click', () => {
            closeModal();
            if (confirmCallback) confirmCallback();
        });
    } else {
        document.getElementById('admin-modal-ok-btn').addEventListener('click', closeModal);
    }
}