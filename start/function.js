// --- LOCAL STORAGE DATA SYNC CORES ---
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [
            { username: "customer1", password: "password123", name: "Juan Dela Cruz", points: 50 }
        ];

        let buyHistory = JSON.parse(localStorage.getItem('buyHistory')) || [];

        let currentUserUsername = localStorage.getItem('currentUserUsername') || "";
        let currentAccountName = localStorage.getItem('currentAccountName') || "Guest User";
        
        // Hahanapin kung magkano ang points ng kasalukuyang user, kung wala o guest, default to 50
        let activeUserObj = registeredUsers.find(u => u.username === currentUserUsername);
        let userPoints = activeUserObj ? (activeUserObj.points ?? 50) : 50;

        let cart = [];
        let currentCafe = "";

        const cafeStories = {
            "Rainy Café": "A safe haven enveloped by rhythmic downpours, misty window panes, and classic lo-fi tracks.",
            "Midnight Café": "A peaceful dark sanctuary built specifically for night thinkers, deep dreamers, and quiet souls.",
            "Sakura Café": "A calming, warm environment surrounded by delicate pale petals and light ambient strings.",
            "Beach Café": "Sun-bleached wood counters catching crisp coastal breezes alongside acoustic melodies.",
            "Study Café": "A streamlined, high-focus productivity zone optimized with quiet structural processing loops.",
            "Gamer Café": "A premium space with low warm lighting, subtle neon highlights, and high frames performance tracking."
        };

        // --- MENU STOCK REGISTER STORAGE SYNC ---
        let databaseMenu = JSON.parse(localStorage.getItem('databaseMenu')) || [
            { id: 1, cafe: "Midnight Café", type: "drinks", name: "Midnight Latte", price: 120, stock: 10 },
            { id: 2, cafe: "Midnight Café", type: "drinks", name: "Dark Espresso", price: 100, stock: 5 },
            { id: 3, cafe: "Midnight Café", type: "desserts", name: "Chocolate Cake", price: 110, stock: 2 },
            { id: 4, cafe: "Rainy Café", type: "drinks", name: "Drizzle Brew Blend", price: 130, stock: 12 },
            { id: 5, cafe: "Rainy Café", type: "desserts", name: "Warm Glazed Cookies", price: 80, stock: 0 },
            { id: 6, cafe: "Gamer Café", type: "drinks", name: "Overclock Energy Overload", price: 140, stock: 20 }
        ];
        
        // INITIALIZATION MATRIX UPON INITIAL LOAD
        document.addEventListener("DOMContentLoaded", () => {
            document.getElementById('user-points-top').innerText = `${userPoints} pts`;
            document.getElementById('user-points-total').innerText = `${userPoints} pts`;
            if (currentUserUsername !== "") {
                document.getElementById('profile-user-title').innerText = currentAccountName;
                document.getElementById('user-points-wrapper').style.display = "block";
                document.getElementById('global-nav').style.display = 'flex';
                exitGateway();
                showScreen('screen-selector');
            }
            updateCartUI();
            renderBuyHistoryUI();
        });

        function showAuth(type) {
            document.getElementById('screen-landing').classList.remove('active');
            document.getElementById('screen-login').classList.remove('active');
            document.getElementById('screen-signup').classList.remove('active');
            document.getElementById(`screen-${type}`).classList.add('active');
        }

        function validateAccess(mode) {
            if (mode === 'login') {
                const userInput = document.getElementById('login-user').value.trim();
                const passInput = document.getElementById('login-pass').value.trim();

                if (userInput === "" || passInput === "") {
                    showCustomAlert("Fields Incomplete", "Please enter both your username and password.", false);
                    return;
                }

                if (userInput === "JoseADMIN" && passInput === "12345") {
                    window.location.href = "Admin/Admin.html";
                    return;
                }
                
                const validAccount = registeredUsers.find(user => user.username === userInput && user.password === passInput);

                if (validAccount) {
                    currentAccountName = validAccount.name;
                    currentUserUsername = validAccount.username;
                    
                    // --- DYNAMIC POINTS ALLOCATION RETRIEVAL ---
                    if (validAccount.points === undefined) {
                        validAccount.points = 50;
                        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                    }
                    userPoints = validAccount.points;

                    localStorage.setItem('currentAccountName', currentAccountName);
                    localStorage.setItem('currentUserUsername', currentUserUsername);
                } else {
                    showCustomAlert("Access Denied", "Incorrect username/password or account identity not registered.", false);
                    return;
                }

            } else if (mode === 'signup') {
                const signupName = document.getElementById('signup-name').value.trim();
                const signupUser = document.getElementById('signup-user').value.trim();
                const signupPass = document.getElementById('signup-pass').value.trim();

                if (signupName === "" || signupUser === "" || signupPass === "") {
                    showCustomAlert("Registration Error", "Please complete all registration fields loop.", false);
                    return;
                }

                const isExisting = registeredUsers.some(user => user.username === signupUser);
                if (isExisting) {
                    showCustomAlert("Identity Collision", "Username is already taken! Please choose another selector.", false);
                    return;
                }

                // --- NEW ACCOUNT BASE RULE: Baseline 50 points ---
                registeredUsers.push({ 
                    username: signupUser, 
                    password: signupPass, 
                    name: signupName, 
                    points: 50 
                });
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

                showCustomAlert("Success Verified", "Account successfully registered with 50 baseline points! You can now access login gateway.", true);
                
                document.getElementById('signup-name').value = "";
                document.getElementById('signup-user').value = "";
                document.getElementById('signup-pass').value = "";

                showAuth('login');
                return;
            }

            // I-refresh ang text interface elements bago pumasok
            document.getElementById('profile-user-title').innerText = currentAccountName;
            document.getElementById('user-points-top').innerText = `${userPoints} pts`;
            document.getElementById('user-points-total').innerText = `${userPoints} pts`;
            document.getElementById('user-points-wrapper').style.display = "block";
            document.getElementById('global-nav').style.display = 'flex';
            
            exitGateway();
            showScreen('screen-selector');
            renderBuyHistoryUI();
        }

        function exitGateway() {
            document.getElementById('screen-landing').classList.remove('active');
            document.getElementById('screen-login').classList.remove('active');
            document.getElementById('screen-signup').classList.remove('active');
            document.getElementById('main-header').style.display = 'flex';
        }

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
            
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            if(screenId === 'screen-selector' || screenId === 'screen-cafe') document.getElementById('nav-btn-cafes').classList.add('active');
            if(screenId === 'screen-cart') {
                document.getElementById('cart-display-name').value = currentAccountName;
                document.getElementById('nav-btn-cart').classList.add('active');
            }
            if(screenId === 'screen-profile') {
                document.getElementById('nav-btn-profile').classList.add('active');
                renderBuyHistoryUI();
            }
        }

        function handleBrandClick() {
            showScreen('screen-selector');
        }

        function openCafe(name, icon) {
            currentCafe = name;
            document.getElementById('current-cafe-name').innerText = `${icon} ${name}`;
            document.getElementById('current-cafe-story').innerText = cafeStories[name] || "";
            filterMenu('all');
            showScreen('screen-cafe');
        }

        function filterMenu(category) {
            document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
            if(window.event && window.event.target && window.event.target.classList.contains('filter-chip')) {
                window.event.target.classList.add('active');
            }

            const container = document.getElementById('menu-items-container');
            container.innerHTML = "";

            const filteredItems = databaseMenu.filter(item => {
                if (item.cafe !== currentCafe) return false;
                return category === 'all' || item.type === category;
            });

            if(filteredItems.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding:24px;">No items available in this category.</p>`;
                return;
            }

            filteredItems.forEach(item => {
                const actionMarkup = item.stock > 0 
                    ? `<button class="btn-add" onclick="addToCart(${item.id})">[ Add to Cart ]</button>`
                    : `<span class="out-of-stock">Out of Stock</span>`;

                container.innerHTML += `
                    <div class="glass-panel item-card">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>₱${item.price} — Available Stock: ${item.stock}</p>
                        </div>
                        <div class="item-action">${actionMarkup}</div>
                    </div>
                `;
            });
        }

        function addToCart(id) {
            const product = databaseMenu.find(item => item.id === id);
            if(product && product.stock > 0) {
                cart.push(product);
                product.stock--; 
                
                localStorage.setItem('databaseMenu', JSON.stringify(databaseMenu));
                
                updateCartUI();
                filterMenu('all');
            }
        }

        function updateCartUI() {
            document.getElementById('cart-count').innerText = cart.length;
            const container = document.getElementById('cart-container');
            
            if(cart.length === 0) {
                container.innerHTML = `<p style="color:var(--text-muted); text-align:center; font-size:0.85rem; padding:12px 0;">Your ordering tray is completely empty.</p>`;
                document.getElementById('checkout-form-container').style.display = 'none';
                return;
            }

            document.getElementById('checkout-form-container').style.display = 'block';
            container.innerHTML = "";
            
            let occurrences = {};
            cart.forEach(item => occurrences[item.name] = (occurrences[item.name] || 0) + 1);

            let costSum = 0;
            for(let name in occurrences) {
                const itemObj = cart.find(i => i.name === name);
                const combinedRowCost = itemObj.price * occurrences[name];
                costSum += combinedRowCost;
                
                container.innerHTML += `
                    <div class="cart-item">
                        <span>${name} <strong style="color:var(--accent-warm);">x${occurrences[name]}</strong></span>
                        <span>₱${combinedRowCost}</span>
                    </div>
                `;
            }

            container.innerHTML += `
                <div class="cart-total">
                    <span>Summary Total:</span>
                    <span style="color:var(--accent-glow)">₱${costSum}</span>
                </div>
            `;
        }

        // PLACE ORDER WITH CUSTOM APP NOTIFICATION & ACCOUNT POINTS SYNC
        function placeOrder() {
            if (cart.length === 0) return;

            const paymentMethod = document.getElementById('cart-payment-method').value;
            const totalItemsBought = cart.length; 
            const pointsEarned = totalItemsBought * 5;
            let totalCost = cart.reduce((sum, item) => sum + item.price, 0);

            let occurrences = {};
            cart.forEach(item => occurrences[item.name] = (occurrences[item.name] || 0) + 1);
            let itemsSummaryArray = [];
            for(let name in occurrences) {
                itemsSummaryArray.push(`${name} (x${occurrences[name]})`);
            }
            let itemDescription = itemsSummaryArray.join(", ");

            const now = new Date();
            const timestampStr = now.toLocaleDateString() + " | " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            buyHistory.unshift({
                username: currentUserUsername, 
                items: itemDescription,
                total: totalCost,
                gateway: paymentMethod,
                time: timestampStr
            });

            localStorage.setItem('buyHistory', JSON.stringify(buyHistory));

            // Points balance adjustment
            userPoints += pointsEarned;
            
            // Sync pabalik sa specific user database element
            let userAccountInRegistry = registeredUsers.find(u => u.username === currentUserUsername);
            if (userAccountInRegistry) {
                userAccountInRegistry.points = userPoints;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }

            document.getElementById('user-points-top').innerText = `${userPoints} pts`;
            document.getElementById('user-points-total').innerText = `${userPoints} pts`;

            // Custom Modern Modal para sa Check Out success state
            showCustomAlert(
                "Transaction Verified", 
                `Verified via ${paymentMethod}!\n\nYou bought ${totalItemsBought} item(s) and earned +${pointsEarned} loyalty points! 🎉`, 
                true
            );
            
            cart = [];
            updateCartUI();
            showScreen('screen-selector');
        }

        function renderBuyHistoryUI() {
            const historyBox = document.getElementById('profile-buy-history-box');
            if(!historyBox) return;

            const userLogs = buyHistory.filter(log => log.username === currentUserUsername);

            if(userLogs.length === 0) {
                historyBox.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; font-style:italic; text-align:center; padding:12px 0;">No order logs found for this account.</p>`;
                return;
            }

            historyBox.innerHTML = "";
            userLogs.forEach(log => {
                historyBox.innerHTML += `
                    <div style="background:rgba(0,0,0,0.25); padding:10px; border-radius:8px; border-left:3px solid var(--accent-warm); font-size:0.8rem; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; font-weight:600; margin-bottom:4px;">
                            <span style="color:var(--text-primary); max-width:70%; word-break:break-word;">${log.items}</span>
                            <span style="color:var(--accent-glow);">₱${log.total}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.7rem;">
                            <span>via ${log.gateway}</span>
                            <span>📅 ${log.time}</span>
                        </div>
                    </div>
                `;
            });
        }

        function claimPoints() {
            userPoints += 10;
            
            let userAccountInRegistry = registeredUsers.find(u => u.username === currentUserUsername);
            if (userAccountInRegistry) {
                userAccountInRegistry.points = userPoints;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }

            document.getElementById('user-points-top').innerText = `${userPoints} pts`;
            document.getElementById('user-points-total').innerText = `${userPoints} pts`;
            
            const btn = document.getElementById('claim-btn');
            btn.innerText = "Claimed";
            btn.disabled = true;
            btn.style.opacity = "0.3";

            showCustomAlert("Daily Bonus", "Successfully claimed +10 loyalty points!", true);
        }

        function logoutCustomer() {
            // Gumamit na rin ng Custom Alert bago tuluyang i-wipe ang state session
            localStorage.removeItem('currentAccountName');
            localStorage.removeItem('currentUserUsername');
            
            currentUserUsername = "";
            currentAccountName = "Guest User";
            userPoints = 50; // default back
            cart = [];
            
            updateCartUI();

            document.getElementById('global-nav').style.display = 'none';
            document.getElementById('main-header').style.display = 'none';

            document.getElementById('login-user').value = "";
            document.getElementById('login-pass').value = "";

            showScreen('screen-landing');
            showCustomAlert("Logged Out", "Successfully logged out. Session secured!", true);
        }

        // --- GLOBAL APP-STYLE MODAL NOTIFICATION ENGINE ---
        function showCustomAlert(title, message, isSuccess = false) {
            const existingModal = document.getElementById('app-custom-modal');
            if (existingModal) existingModal.remove();

            const icon = isSuccess ? "✨" : "❌";
            const accentColor = isSuccess ? "var(--accent-glow, #c5a880)" : "#ff4a4a";

            const modalHTML = `
                <div id="app-custom-modal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.75);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(8px);
                    opacity: 0;
                    transition: opacity 0.25s ease-in-out;
                ">
                    <div style="
                        background: #1c1917;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-top: 4px solid ${accentColor};
                        border-radius: 16px;
                        padding: 24px;
                        width: 85%;
                        max-width: 340px;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                        transform: scale(0.9);
                        transition: transform 0.25s ease-in-out;
                    ">
                        <div style="font-size: 2.8rem; margin-bottom: 12px;">${icon}</div>
                        <h3 style="color: white; font-size: 1.15rem; font-weight: 600; margin-bottom: 10px; font-family: sans-serif; letter-spacing: 0.5px;">
                            ${title}
                        </h3>
                        <p style="color: #9e948a; font-size: 0.85rem; margin-bottom: 22px; font-family: sans-serif; line-height: 1.4; white-space: pre-line;">
                            ${message}
                        </p>
                        <button id="app-modal-ok-btn" style="
                            background: linear-gradient(135deg, #5c2323, #3a1515);
                            color: #ffb3b3;
                            border: 1px solid rgba(255,0,0,0.15);
                            padding: 12px;
                            border-radius: 8px;
                            font-size: 0.9rem;
                            font-weight: 600;
                            cursor: pointer;
                            width: 100%;
                            font-family: sans-serif;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                        }">
                            Dismiss
                        </button>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const overlay = document.getElementById('app-custom-modal');
            const content = overlay.children[0];
            const btn = document.getElementById('app-modal-ok-btn');

            setTimeout(() => {
                overlay.style.opacity = "1";
                content.style.transform = "scale(1)";
            }, 10);

            btn.addEventListener('click', () => {
                overlay.style.opacity = "0";
                content.style.transform = "scale(0.9)";
                setTimeout(() => overlay.remove(), 250);
            });
        }
