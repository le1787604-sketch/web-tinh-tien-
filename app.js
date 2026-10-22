(function () {
  'use strict';

  const USERS_STORAGE_KEY = 'profit_users_list_v3';
  const ACTIVE_USER_KEY = 'profit_active_user_v3';

  let users = [];
  let currentUser = null;
  let products = [];
  let selectedMonth = '';
  let searchQuery = '';
  let sortOrder = 'date-desc';

  const userDropdownBtn = document.getElementById('userDropdownBtn');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const currentUserNameDisplay = document.getElementById('currentUserNameDisplay');
  const usersListContainer = document.getElementById('usersListContainer');
  const addNewUserBtn = document.getElementById('addNewUserBtn');
  const renameUserBtn = document.getElementById('renameUserBtn');
  const deleteUserBtn = document.getElementById('deleteUserBtn');
  const activeUserBadge = document.getElementById('activeUserBadge');

  const addUserModal = document.getElementById('addUserModal');
  const addUserForm = document.getElementById('addUserForm');
  const newUserNameInput = document.getElementById('newUserNameInput');
  const closeAddUserModalBtn = document.getElementById('closeAddUserModalBtn');
  const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');

  const openModalBtn = document.getElementById('openModalBtn');
  const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtnText = document.getElementById('submitBtnText');
  const editProductIdInput = document.getElementById('editProductId');

  const productNameInput = document.getElementById('productNameInput');
  const quantityInput = document.getElementById('quantityInput');
  const buyPriceInput = document.getElementById('buyPriceInput');
  const sellPriceInput = document.getElementById('sellPriceInput');
  const saleDateInput = document.getElementById('saleDateInput');
  const productNoteInput = document.getElementById('productNoteInput');

  const profitPreviewBanner = document.getElementById('profitPreviewBanner');
  const previewTotalCostText = document.getElementById('previewTotalCostText');
  const previewTotalRevenueText = document.getElementById('previewTotalRevenueText');
  const previewProfitText = document.getElementById('previewProfitText');
  const previewMarginText = document.getElementById('previewMarginText');

  const selectedMonthInput = document.getElementById('selectedMonthInput');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const showAllBtn = document.getElementById('showAllBtn');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const addSampleBtn = document.getElementById('addSampleBtn');

  const totalProfitDisplay = document.getElementById('totalProfitDisplay');
  const profitMarginDisplay = document.getElementById('profitMarginDisplay');
  const totalRevenueDisplay = document.getElementById('totalRevenueDisplay');
  const totalItemsDisplay = document.getElementById('totalItemsDisplay');
  const totalCostDisplay = document.getElementById('totalCostDisplay');
  const totalQuantityDisplay = document.getElementById('totalQuantityDisplay');
  const profitCard = document.getElementById('profitCard');

  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const filteredCountBadge = document.getElementById('filteredCountBadge');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  function init() {
    initUsers();
    loadCurrentUserData();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    selectedMonth = currentYear + '-' + currentMonth;
    selectedMonthInput.value = selectedMonth;

    saleDateInput.value = today.toISOString().split('T')[0];

    setupUserEvents();
    setupMainEvents();
    setupTxtEvents();
    render();
  }

  function initUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) users = JSON.parse(stored);
    } catch (e) {
      users = [];
    }
    if (!Array.isArray(users) || users.length === 0) {
      users = [{ id: 'user_default', name: 'Tài khoản chính' }];
      saveUsersList();
    }
    const activeId = localStorage.getItem(ACTIVE_USER_KEY);
    currentUser = users.find(function(u) { return u.id === activeId; }) || users[0];
    localStorage.setItem(ACTIVE_USER_KEY, currentUser.id);
  }

  function saveUsersList() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  function getUserStorageKey(userId) {
    return 'profit_data_user_' + userId;
  }

  function loadCurrentUserData() {
    if (!currentUser) return;
    currentUserNameDisplay.textContent = currentUser.name;
    activeUserBadge.innerHTML = '<i class="fa-solid fa-user"></i> ' + escapeHtml(currentUser.name);

    const userKey = getUserStorageKey(currentUser.id);
    try {
      const raw = localStorage.getItem(userKey);
      if (raw) {
        products = JSON.parse(raw);
      } else {
        if (currentUser.id === 'user_default') {
          const oldV2 = localStorage.getItem('monthly_profit_products_v2') || localStorage.getItem('monthly_profit_products_v1');
          if (oldV2) {
            products = JSON.parse(oldV2);
          } else if (window.INITIAL_PRODUCTS && window.INITIAL_PRODUCTS.length > 0) {
            products = JSON.parse(JSON.stringify(window.INITIAL_PRODUCTS));
          } else {
            products = [];
          }
          saveCurrentUserData();
        } else {
          products = [];
        }
      }
    } catch (e) {
      products = [];
    }
    renderUserDropdownList();
  }

  function saveCurrentUserData() {
    if (!currentUser) return;
    localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(products));
  }

  function switchUser(userId) {
    const target = users.find(function(u) { return u.id === userId; });
    if (!target) return;
    currentUser = target;
    localStorage.setItem(ACTIVE_USER_KEY, currentUser.id);
    userDropdownMenu.classList.add('hidden');
    loadCurrentUserData();
    showToast('Đã chuyển sang: "' + currentUser.name + '"', 'success');
    render();
  }

  function renderUserDropdownList() {
    usersListContainer.innerHTML = '';
    users.forEach(function(u) {
      const btn = document.createElement('button');
      btn.className = 'user-list-item ' + (u.id === currentUser.id ? 'active' : '');
      btn.innerHTML = '<span><i class="fa-solid fa-user-check" style="margin-right: 6px; ' + (u.id === currentUser.id ? 'opacity: 1;' : 'opacity: 0;') + '"></i>' + escapeHtml(u.name) + '</span>' + (u.id === currentUser.id ? '<span style="font-size: 0.72rem; opacity: 0.8;">Đang dùng</span>' : '');
      btn.addEventListener('click', function() { switchUser(u.id); });
      usersListContainer.appendChild(btn);
    });
  }

  function setupUserEvents() {
    userDropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', function(e) {
      if (!userDropdownMenu.contains(e.target) && !userDropdownBtn.contains(e.target)) {
        userDropdownMenu.classList.add('hidden');
      }
    });

    addNewUserBtn.addEventListener('click', function() {
      userDropdownMenu.classList.add('hidden');
      newUserNameInput.value = '';
      addUserModal.classList.remove('hidden');
      setTimeout(function() { newUserNameInput.focus(); }, 100);
    });

    closeAddUserModalBtn.addEventListener('click', function() { addUserModal.classList.add('hidden'); });
    cancelAddUserBtn.addEventListener('click', function() { addUserModal.classList.add('hidden'); });

    addUserForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = newUserNameInput.value.trim();
      if (!name) return;
      const newId = 'user_' + Date.now();
      users.push({ id: newId, name: name });
      saveUsersList();
      addUserModal.classList.add('hidden');
      switchUser(newId);
    });

    renameUserBtn.addEventListener('click', function() {
      userDropdownMenu.classList.add('hidden');
      const newName = prompt('Nhập tên mới cho người dùng "' + currentUser.name + '":', currentUser.name);
      if (newName && newName.trim()) {
        currentUser.name = newName.trim();
        saveUsersList();
        loadCurrentUserData();
        showToast('Đã đổi tên người dùng thành công!', 'success');
      }
    });

    deleteUserBtn.addEventListener('click', function() {
      userDropdownMenu.classList.add('hidden');
      if (users.length <= 1) {
        alert('Phải giữ lại ít nhất 1 người dùng!');
        return;
      }
      if (!confirm('Bạn có chắc muốn xóa "' + currentUser.name + '" cùng toàn bộ dữ liệu riêng của người này?')) return;
      localStorage.removeItem(getUserStorageKey(currentUser.id));
      users = users.filter(function(u) { return u.id !== currentUser.id; });
      saveUsersList();
      switchUser(users[0].id);
      showToast('Đã xóa người dùng thành công!', 'danger');
    });
  }
  function setupMainEvents() {
    openModalBtn.addEventListener('click', function() { openProductModal(); });
    emptyStateAddBtn.addEventListener('click', function() { openProductModal(); });

    closeModalBtn.addEventListener('click', closeProductModal);
    cancelModalBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', function(e) {
      if (e.target === productModal) closeProductModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (!productModal.classList.contains('hidden')) closeProductModal();
        if (!txtModal.classList.contains('hidden')) closeTxtModal();
        if (!addUserModal.classList.contains('hidden')) addUserModal.classList.add('hidden');
      }
    });

    productForm.addEventListener('submit', handleProductFormSubmit);

    quantityInput.addEventListener('input', updateProfitPreview);
    buyPriceInput.addEventListener('input', function() {
      formatCurrencyInput(buyPriceInput);
      updateProfitPreview();
    });
    sellPriceInput.addEventListener('input', function() {
      formatCurrencyInput(sellPriceInput);
      updateProfitPreview();
    });

    selectedMonthInput.addEventListener('change', function(e) {
      selectedMonth = e.target.value;
      showAllBtn.classList.remove('active');
      render();
    });

    prevMonthBtn.addEventListener('click', function() { changeMonth(-1); });
    nextMonthBtn.addEventListener('click', function() { changeMonth(1); });

    showAllBtn.addEventListener('click', function() {
      if (selectedMonth === '') {
        const now = new Date();
        selectedMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        selectedMonthInput.value = selectedMonth;
        showAllBtn.classList.remove('active');
      } else {
        selectedMonth = '';
        selectedMonthInput.value = '';
        showAllBtn.classList.add('active');
      }
      render();
    });

    searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value.trim().toLowerCase();
      render();
    });

    sortSelect.addEventListener('change', function(e) {
      sortOrder = e.target.value;
      render();
    });

    addSampleBtn.addEventListener('click', loadSampleData);
    exportExcelBtn.addEventListener('click', exportToExcel);
    exportCsvBtn.addEventListener('click', exportToCsv);
  }

  function openProductModal(productId) {
    productForm.reset();
    editProductIdInput.value = '';
    quantityInput.value = 1;

    if (productId) {
      const item = products.find(function(p) { return p.id === productId; });
      if (!item) return;

      modalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
      submitBtnText.textContent = 'Lưu thay đổi';
      editProductIdInput.value = item.id;
      productNameInput.value = item.name;
      quantityInput.value = item.quantity || 1;
      buyPriceInput.value = formatNumberWithCommas(item.unitBuyPrice || item.buyPrice || 0);
      sellPriceInput.value = formatNumberWithCommas(item.unitSellPrice || item.sellPrice || 0);
      saleDateInput.value = item.saleDate;
      productNoteInput.value = item.note || '';
    } else {
      modalTitle.textContent = 'Thêm Sản Phẩm Mới';
      submitBtnText.textContent = 'Xác nhận';
      if (selectedMonth) {
        const today = new Date();
        const currentYearMonth = today.toISOString().slice(0, 7);
        saleDateInput.value = (selectedMonth === currentYearMonth) ? today.toISOString().split('T')[0] : (selectedMonth + '-01');
      } else {
        saleDateInput.value = new Date().toISOString().split('T')[0];
      }
    }

    updateProfitPreview();
    productModal.classList.remove('hidden');
    setTimeout(function() { productNameInput.focus(); }, 100);
  }

  function closeProductModal() {
    productModal.classList.add('hidden');
    productForm.reset();
  }

  function updateProfitPreview() {
    const qty = Math.max(1, parseInt(quantityInput.value, 10) || 1);
    const unitBuy = parsePriceNumber(buyPriceInput.value);
    const unitSell = parsePriceNumber(sellPriceInput.value);

    const totalCost = unitBuy * qty;
    const totalRev = unitSell * qty;
    const totalProfit = totalRev - totalCost;

    let margin = 0;
    if (totalCost > 0) {
      margin = ((totalProfit / totalCost) * 100).toFixed(1);
    } else if (totalRev > 0) {
      margin = 100;
    }

    previewTotalCostText.textContent = formatCurrency(totalCost);
    previewTotalRevenueText.textContent = formatCurrency(totalRev);

    if (totalProfit > 0) {
      profitPreviewBanner.classList.remove('is-loss');
      previewProfitText.textContent = '+' + formatCurrency(totalProfit);
      previewMarginText.textContent = '+' + margin + '%';
    } else if (totalProfit < 0) {
      profitPreviewBanner.classList.add('is-loss');
      previewProfitText.textContent = '-' + formatCurrency(Math.abs(totalProfit));
      previewMarginText.textContent = margin + '%';
    } else {
      profitPreviewBanner.classList.remove('is-loss');
      previewProfitText.textContent = '0 ₫';
      previewMarginText.textContent = '0%';
    }
  }

  function handleProductFormSubmit(e) {
    e.preventDefault();

    const name = productNameInput.value.trim();
    const qty = Math.max(1, parseInt(quantityInput.value, 10) || 1);
    const unitBuy = parsePriceNumber(buyPriceInput.value);
    const unitSell = parsePriceNumber(sellPriceInput.value);
    const saleDate = saleDateInput.value;
    const note = productNoteInput.value.trim();
    const editId = editProductIdInput.value;

    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      productNameInput.focus();
      return;
    }

    const totalBuy = unitBuy * qty;
    const totalSell = unitSell * qty;
    const totalProfit = totalSell - totalBuy;

    if (editId) {
      const idx = products.findIndex(function(p) { return p.id === editId; });
      if (idx !== -1) {
        products[idx] = Object.assign({}, products[idx], {
          name: name,
          quantity: qty,
          unitBuyPrice: unitBuy,
          totalBuyPrice: totalBuy,
          unitSellPrice: unitSell,
          totalSellPrice: totalSell,
          totalProfit: totalProfit,
          saleDate: saleDate,
          note: note
        });
        showToast('Đã cập nhật sản phẩm "' + name + '"!', 'success');
      }
    } else {
      const newProduct = {
        id: 'sp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: name,
        quantity: qty,
        unitBuyPrice: unitBuy,
        totalBuyPrice: totalBuy,
        unitSellPrice: unitSell,
        totalSellPrice: totalSell,
        totalProfit: totalProfit,
        saleDate: saleDate,
        note: note,
        createdAt: Date.now()
      };
      products.unshift(newProduct);

      const productYearMonth = saleDate.slice(0, 7);
      if (selectedMonth && selectedMonth !== productYearMonth) {
        selectedMonth = productYearMonth;
        selectedMonthInput.value = selectedMonth;
        showAllBtn.classList.remove('active');
      }

      showToast('Đã thêm "' + name + '" (' + qty + ' cái) - Lãi: +' + formatCurrency(totalProfit), 'success');
    }

    saveCurrentUserData();
    closeProductModal();
    render();
  }

  window.editProduct = function (productId) {
    openProductModal(productId);
  };

  window.deleteProduct = function (productId) {
    const item = products.find(function(p) { return p.id === productId; });
    if (!item) return;

    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm "' + item.name + '" không?')) {
      products = products.filter(function(p) { return p.id !== productId; });
      saveCurrentUserData();
      showToast('Đã xóa "' + item.name + '"', 'danger');
      render();
    }
  };

  function changeMonth(delta) {
    let year, month;
    if (!selectedMonth) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    } else {
      const parts = selectedMonth.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
    }

    const newDate = new Date(year, month + delta, 1);
    const newMonthStr = String(newDate.getMonth() + 1).padStart(2, '0');
    selectedMonth = newDate.getFullYear() + '-' + newMonthStr;
    selectedMonthInput.value = selectedMonth;
    showAllBtn.classList.remove('active');
    render();
  }

  function getProductQuantity(p) {
    return p.quantity || 1;
  }

  function getProductUnitCost(p) {
    if (p.unitBuyPrice !== undefined) return p.unitBuyPrice;
    if (p.buyPrice !== undefined) return p.buyPrice;
    return 0;
  }

  function getProductTotalCost(p) {
    if (p.totalBuyPrice !== undefined) return p.totalBuyPrice;
    return getProductUnitCost(p) * getProductQuantity(p);
  }

  function getProductUnitRevenue(p) {
    if (p.unitSellPrice !== undefined) return p.unitSellPrice;
    if (p.sellPrice !== undefined) return p.sellPrice;
    return 0;
  }

  function getProductTotalRevenue(p) {
    if (p.totalSellPrice !== undefined) return p.totalSellPrice;
    return getProductUnitRevenue(p) * getProductQuantity(p);
  }

  function getProductProfit(p) {
    if (p.totalProfit !== undefined) return p.totalProfit;
    return getProductTotalRevenue(p) - getProductTotalCost(p);
  }

  function render() {
    let filtered = products.filter(function(p) {
      if (!selectedMonth) return true;
      return p.saleDate.indexOf(selectedMonth) === 0;
    });

    if (searchQuery) {
      filtered = filtered.filter(function(p) {
        return p.name.toLowerCase().indexOf(searchQuery) !== -1;
      });
    }

    filtered.sort(function(a, b) {
      const profitA = getProductProfit(a);
      const profitB = getProductProfit(b);
      if (sortOrder === 'date-desc') {
        return new Date(b.saleDate) - new Date(a.saleDate) || (b.createdAt || 0) - (a.createdAt || 0);
      } else if (sortOrder === 'date-asc') {
        return new Date(a.saleDate) - new Date(b.saleDate) || (a.createdAt || 0) - (b.createdAt || 0);
      } else if (sortOrder === 'profit-desc') {
        return profitB - profitA;
      } else if (sortOrder === 'profit-asc') {
        return profitA - profitB;
      }
      return 0;
    });

    let sumCost = 0;
    let sumRevenue = 0;
    let sumProfit = 0;
    let sumQuantity = 0;

    filtered.forEach(function(p) {
      sumCost += getProductTotalCost(p);
      sumRevenue += getProductTotalRevenue(p);
      sumProfit += getProductProfit(p);
      sumQuantity += getProductQuantity(p);
    });

    totalCostDisplay.textContent = formatCurrency(sumCost);
    totalRevenueDisplay.textContent = formatCurrency(sumRevenue);
    totalItemsDisplay.textContent = filtered.length + ' sản phẩm (Tổng SL: ' + sumQuantity + ' cái)';
    totalQuantityDisplay.textContent = 'Tổng số lượng: ' + sumQuantity + ' cái';

    if (sumProfit > 0) {
      totalProfitDisplay.textContent = '+' + formatCurrency(sumProfit);
      profitCard.classList.remove('is-loss');
    } else if (sumProfit < 0) {
      totalProfitDisplay.textContent = '-' + formatCurrency(Math.abs(sumProfit));
      profitCard.classList.add('is-loss');
    } else {
      totalProfitDisplay.textContent = '0 ₫';
      profitCard.classList.remove('is-loss');
    }

    let margin = 0;
    if (sumCost > 0) {
      margin = ((sumProfit / sumCost) * 100).toFixed(1);
    } else if (sumRevenue > 0) {
      margin = 100;
    }
    profitMarginDisplay.textContent = 'Tỷ suất lợi nhuận: ' + (sumProfit >= 0 ? '+' : '') + margin + '%';
    filteredCountBadge.textContent = filtered.length + ' sản phẩm (' + sumQuantity + ' cái)';

    renderProductCards(filtered);
  }

  function renderProductCards(list) {
    productsGrid.innerHTML = '';

    if (list.length === 0) {
      productsGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    productsGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    list.forEach(function(item) {
      const qty = getProductQuantity(item);
      const unitBuy = getProductUnitCost(item);
      const totalBuy = getProductTotalCost(item);
      const unitSell = getProductUnitRevenue(item);
      const totalSell = getProductTotalRevenue(item);
      const profit = getProductProfit(item);

      let profitBoxClass = 'profit-positive';
      let profitPrefix = '+';
      let profitTag = 'Tiền lời';

      if (profit < 0) {
        profitBoxClass = 'profit-negative';
        profitPrefix = '-';
        profitTag = 'Tiền lỗ';
      } else if (profit === 0) {
        profitBoxClass = 'profit-zero';
        profitPrefix = '';
        profitTag = 'Hòa vốn';
      }

      let margin = 0;
      if (totalBuy > 0) {
        margin = ((profit / totalBuy) * 100).toFixed(1);
      } else if (totalSell > 0) {
        margin = 100;
      }

      const dateParts = item.saleDate.split('-');
      const formattedDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

      const card = document.createElement('div');
      card.className = 'product-card';

      const safeName = escapeHtml(item.name);
      const safeNote = item.note ? escapeHtml(item.note) : '';

      card.innerHTML = 
        '<div class="card-content-wrap">' +
          '<div class="card-top">' +
            '<h4 class="card-product-name">' + safeName + '</h4>' +
            '<div style="display: flex; gap: 6px; align-items: center;">' +
              '<span class="card-qty-badge"><i class="fa-solid fa-cubes-stacked"></i> x' + qty + '</span>' +
              '<span class="card-date-badge"><i class="fa-regular fa-calendar"></i> ' + formattedDate + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="card-details">' +
            '<div class="detail-row">' +
              '<span class="detail-label"><i class="fa-solid fa-cart-shopping"></i> Tiền nhập:</span>' +
              '<span class="detail-val">' +
                (qty > 1 ? '<small style="color: var(--text-muted); font-weight: normal;">' + formatCurrency(unitBuy) + ' x ' + qty + ' =</small> ' : '') +
                formatCurrency(totalBuy) +
              '</span>' +
            '</div>' +
            '<div class="detail-row">' +
              '<span class="detail-label"><i class="fa-solid fa-tag"></i> Tiền bán:</span>' +
              '<span class="detail-val">' +
                (qty > 1 ? '<small style="color: var(--text-muted); font-weight: normal;">' + formatCurrency(unitSell) + ' x ' + qty + ' =</small> ' : '') +
                formatCurrency(totalSell) +
              '</span>' +
            '</div>' +
          '</div>' +

          '<div class="card-profit-box ' + profitBoxClass + '">' +
            '<div class="profit-label-group">' +
              '<span class="profit-tag-title">' + profitTag + '</span>' +
              '<span class="profit-margin-percent">' + (profit > 0 ? '+' : '') + margin + '%</span>' +
            '</div>' +
            '<div class="profit-amount">' +
              profitPrefix + formatCurrency(Math.abs(profit)) +
            '</div>' +
          '</div>' +

          (safeNote ? '<div class="card-note"><i class="fa-regular fa-comment-dots"></i> ' + safeNote + '</div>' : '') +
        '</div>' +

        '<div class="card-actions">' +
          '<button class="action-btn" onclick="editProduct(\'' + item.id + '\')" title="Sửa thông tin">' +
            '<i class="fa-solid fa-pen"></i> Sửa' +
          '</button>' +
          '<button class="action-btn btn-delete" onclick="deleteProduct(\'' + item.id + '\')" title="Xóa sản phẩm">' +
            '<i class="fa-solid fa-trash-can"></i> Xóa' +
          '</button>' +
        '</div>';

      productsGrid.appendChild(card);
    });
  }
  function exportToExcel() {
    let filtered = products.filter(function(p) {
      return !selectedMonth || p.saleDate.indexOf(selectedMonth) === 0;
    });

    if (filtered.length === 0) {
      showToast('Không có dữ liệu để xuất file Excel!', 'danger');
      return;
    }

    const userNameSafe = currentUser.name.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_');
    const monthLabel = selectedMonth ? ('thang_' + selectedMonth) : 'tat_ca_thang';
    const filename = 'Bang_Tinh_Tien_Loi_' + userNameSafe + '_' + monthLabel + '.xls';

    let totalQty = 0;
    let totalCost = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    let rowsHtml = '';
    filtered.forEach(function(p, idx) {
      const qty = getProductQuantity(p);
      const unitBuy = getProductUnitCost(p);
      const totalBuy = getProductTotalCost(p);
      const unitSell = getProductUnitRevenue(p);
      const totalSell = getProductTotalRevenue(p);
      const profit = getProductProfit(p);

      totalQty += qty;
      totalCost += totalBuy;
      totalRevenue += totalSell;
      totalProfit += profit;

      const margin = totalBuy > 0 ? (((profit / totalBuy) * 100).toFixed(1) + '%') : '100%';
      const dateParts = p.saleDate.split('-');
      const formattedDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

      rowsHtml += 
        '<tr>' +
          '<td style="text-align: center;">' + (idx + 1) + '</td>' +
          '<td>' + escapeHtml(p.name) + '</td>' +
          '<td style="text-align: center; font-weight: bold;">' + qty + '</td>' +
          '<td style="text-align: right;">' + unitBuy.toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align: right; font-weight: bold;">' + totalBuy.toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align: right;">' + unitSell.toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align: right; font-weight: bold;">' + totalSell.toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align: right; font-weight: bold; color: ' + (profit >= 0 ? '#059669' : '#dc2626') + ';">' + profit.toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align: center;">' + margin + '</td>' +
          '<td style="text-align: center; mso-number-format:\'\\@\';">' + formattedDate + '</td>' +
          '<td>' + escapeHtml(p.note || '') + '</td>' +
        '</tr>';
    });

    const totalMargin = totalCost > 0 ? (((totalProfit / totalCost) * 100).toFixed(1) + '%') : '100%';

    const excelTemplate = 
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Báo Cáo Tiền Lời</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
        '<style>' +
          'table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }' +
          'th { background-color: #2563eb; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #1d4ed8; text-align: center; }' +
          'td { padding: 8px 10px; border: 1px solid #cbd5e1; }' +
          '.header-title { font-size: 16pt; font-weight: bold; color: #1e293b; text-align: center; margin-bottom: 5px; }' +
          '.header-sub { font-size: 10pt; color: #64748b; text-align: center; margin-bottom: 15px; }' +
          '.total-row { background-color: #fef08a; font-weight: bold; border-top: 2px solid #ca8a04; }' +
        '</style>' +
      '</head>' +
      '<body>' +
        '<div class="header-title">BẢNG TÍNH TIỀN LỜI HÀNG THÁNG</div>' +
        '<div class="header-sub">Không gian người dùng: <strong>' + escapeHtml(currentUser.name) + '</strong> | Kỳ báo cáo: <strong>' + (selectedMonth ? ('Tháng ' + selectedMonth) : 'Tất cả các tháng') + '</strong></div>' +
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th style="width: 50px;">STT</th>' +
              '<th style="width: 220px;">Tên sản phẩm</th>' +
              '<th style="width: 80px;">Số lượng</th>' +
              '<th style="width: 130px;">Đơn giá nhập (₫)</th>' +
              '<th style="width: 140px; background-color: #ea580c;">Tổng tiền nhập (₫)</th>' +
              '<th style="width: 130px;">Đơn giá bán (₫)</th>' +
              '<th style="width: 140px; background-color: #1d4ed8;">Tổng tiền bán (₫)</th>' +
              '<th style="width: 150px; background-color: #059669;">Tổng tiền lời (₫)</th>' +
              '<th style="width: 90px;">Tỷ suất lời</th>' +
              '<th style="width: 110px;">Ngày bán</th>' +
              '<th style="width: 180px;">Ghi chú</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            rowsHtml +
            '<tr class="total-row">' +
              '<td colspan="2" style="text-align: center; font-size: 11pt;">TỔNG CỘNG</td>' +
              '<td style="text-align: center; font-size: 11pt; color: #b45309;">' + totalQty + '</td>' +
              '<td></td>' +
              '<td style="text-align: right; font-size: 11pt; color: #c2410c;">' + totalCost.toLocaleString('vi-VN') + '</td>' +
              '<td></td>' +
              '<td style="text-align: right; font-size: 11pt; color: #1d4ed8;">' + totalRevenue.toLocaleString('vi-VN') + '</td>' +
              '<td style="text-align: right; font-size: 12pt; color: #047857;">' + totalProfit.toLocaleString('vi-VN') + '</td>' +
              '<td style="text-align: center;">' + totalMargin + '</td>' +
              '<td colspan="2" style="font-size: 9pt; color: #475569; text-align: center;">Chỉ tính riêng cho: ' + escapeHtml(currentUser.name) + '</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</body>' +
      '</html>';

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    downloadBlob(blob, filename);
    showToast('Đã xuất file Excel cho "' + currentUser.name + '" thành công!', 'success');
  }

  function exportToCsv() {
    let filtered = products.filter(function(p) {
      return !selectedMonth || p.saleDate.indexOf(selectedMonth) === 0;
    });
    if (filtered.length === 0) {
      showToast('Không có dữ liệu để xuất!', 'danger');
      return;
    }

    const userNameSafe = currentUser.name.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_');
    const monthLabel = selectedMonth ? ('thang_' + selectedMonth) : 'tat_ca_thang';
    const filename = 'Bao_Cao_' + userNameSafe + '_' + monthLabel + '.csv';

    let totalQty = 0;
    let totalCost = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    let csvContent = '\uFEFF';
    csvContent += 'STT,Tên sản phẩm,Số lượng,Đơn giá nhập,Tổng tiền nhập,Đơn giá bán,Tổng tiền bán,Tổng tiền lời,Tỷ suất lời (%),Ngày bán,Ghi chú\r\n';

    filtered.forEach(function(p, idx) {
      const qty = getProductQuantity(p);
      const unitBuy = getProductUnitCost(p);
      const totalBuy = getProductTotalCost(p);
      const unitSell = getProductUnitRevenue(p);
      const totalSell = getProductTotalRevenue(p);
      const profit = getProductProfit(p);

      totalQty += qty;
      totalCost += totalBuy;
      totalRevenue += totalSell;
      totalProfit += profit;

      const margin = totalBuy > 0 ? (((profit / totalBuy) * 100).toFixed(1) + '%') : '100%';
      const safeName = '"' + (p.name || '').replace(/"/g, '""') + '"';
      const safeNote = '"' + (p.note || '').replace(/"/g, '""') + '"';
      const dateParts = p.saleDate.split('-');
      const formattedDate = '="' + dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0] + '"';

      csvContent += (idx + 1) + ',' + safeName + ',' + qty + ',' + unitBuy + ',' + totalBuy + ',' + unitSell + ',' + totalSell + ',' + profit + ',' + margin + ',' + formattedDate + ',' + safeNote + '\r\n';
    });

    const totalMargin = totalCost > 0 ? (((totalProfit / totalCost) * 100).toFixed(1) + '%') : '100%';
    csvContent += ',"TỔNG CỘNG",' + totalQty + ',,' + totalCost + ',,' + totalRevenue + ',' + totalProfit + ',' + totalMargin + ',"","Người dùng: ' + currentUser.name + '"\r\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    showToast('Đã xuất file CSV thành công!', 'success');
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /* TXT Module */
  let parsedProductsFromTxt = [];

  const openTxtModalBtn = document.getElementById('openTxtModalBtn');
  const quickTxtBtn = document.getElementById('quickTxtBtn');
  const closeTxtModalBtn = document.getElementById('closeTxtModalBtn');
  const cancelTxtModalBtn = document.getElementById('cancelTxtModalBtn');
  const txtModal = document.getElementById('txtModal');

  const txtDropzone = document.getElementById('txtDropzone');
  const txtFileInput = document.getElementById('txtFileInput');
  const txtPasteArea = document.getElementById('txtPasteArea');
  const txtBatchDateInput = document.getElementById('txtBatchDateInput');
  const txtLoadDemoBtn = document.getElementById('txtLoadDemoBtn');

  const txtPreviewSection = document.getElementById('txtPreviewSection');
  const txtParsedCount = document.getElementById('txtParsedCount');
  const txtParsedTotalQty = document.getElementById('txtParsedTotalQty');
  const txtParsedTotalSummary = document.getElementById('txtParsedTotalSummary');
  const txtPreviewTableBody = document.getElementById('txtPreviewTableBody');
  const confirmTxtImportBtn = document.getElementById('confirmTxtImportBtn');
  const confirmTxtBtnText = document.getElementById('confirmTxtBtnText');

  function setupTxtEvents() {
    openTxtModalBtn.addEventListener('click', openTxtModal);
    quickTxtBtn.addEventListener('click', openTxtModal);
    closeTxtModalBtn.addEventListener('click', closeTxtModal);
    cancelTxtModalBtn.addEventListener('click', closeTxtModal);

    txtModal.addEventListener('click', function(e) {
      if (e.target === txtModal) closeTxtModal();
    });

    txtDropzone.addEventListener('click', function() { txtFileInput.click(); });
    txtFileInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (file) handleTxtFile(file);
    });

    txtDropzone.addEventListener('dragover', function(e) {
      e.preventDefault();
      txtDropzone.classList.add('dragover');
    });
    txtDropzone.addEventListener('dragleave', function() { txtDropzone.classList.remove('dragover'); });
    txtDropzone.addEventListener('drop', function(e) {
      e.preventDefault();
      txtDropzone.classList.remove('dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleTxtFile(file);
    });

    txtPasteArea.addEventListener('input', updateTxtPreview);
    txtBatchDateInput.addEventListener('change', updateTxtPreview);

    txtLoadDemoBtn.addEventListener('click', function() {
      txtPasteArea.value = 
        '2 s75 trắng: 543.600đ (bán 800k lời 256.400đ) =\n' +
        '1 f75 490k ( bán 750k lời 260k)\n' +
        '1 s75 đen contour: 479k + 36k keycape (lời 285k )\n' +
        '1 nova pro: 800k (bán 900k lời 100k)\n' +
        '1 keycape: 0đ ( lời 170k )\n' +
        '1 silent : 167k ( bán 280k lời 113k )\n' +
        '1 silent : 167k ( bán 250 lời 63k )\n' +
        '-----------------------------------\n' +
        'tổng lời : 1247k';
      updateTxtPreview();
    });

    confirmTxtImportBtn.addEventListener('click', handleConfirmTxtImport);
  }

  function openTxtModal() {
    txtBatchDateInput.value = new Date().toISOString().split('T')[0];
    txtPasteArea.value = '';
    txtFileInput.value = '';
    parsedProductsFromTxt = [];
    renderTxtPreviewUI();
    txtModal.classList.remove('hidden');
  }

  function closeTxtModal() {
    txtModal.classList.add('hidden');
  }

  function handleTxtFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      txtPasteArea.value = e.target.result;
      updateTxtPreview();
    };
    reader.readAsText(file, 'utf-8');
  }

  function parseTxtPriceValue(valStr) {
    if (!valStr) return 0;
    let s = String(valStr).trim().toLowerCase().replace(/đ|d/g, '');

    if (s.indexOf('tr') !== -1 || s.indexOf('m') !== -1) {
      s = s.replace(/tr|m/g, '.');
      const numF = parseFloat(s);
      if (!isNaN(numF)) return Math.round(numF * 1000000);
    }

    if (s.indexOf('k') !== -1) {
      s = s.replace('k', '').replace(',', '.');
      const numF = parseFloat(s);
      if (!isNaN(numF)) return Math.round(numF * 1000);
    }

    const clean = s.replace(/[^0-9]/g, '');
    if (!clean) return 0;
    let n = parseInt(clean, 10);
    if (n > 0 && n <= 999) n *= 1000;
    return n;
  }

  function parseTxtSingleLine(line, defaultDate) {
    const raw = line.trim();
    if (!raw) return null;

    if (raw.indexOf('-') === 0 || raw.indexOf('=') === 0 || raw.toLowerCase().indexOf('tổng') === 0 || raw.toLowerCase().indexOf('tong') === 0) {
      return null;
    }

    const parenMatch = raw.match(/\((.*?)\)/);
    const parenContent = parenMatch ? parenMatch[1] : '';
    const outside = (parenMatch ? raw.substring(0, parenMatch.index) : raw).replace(/[=]+$/, '').trim();

    let sellPrice = null;
    let profit = null;

    if (parenContent) {
      const banMatch = parenContent.match(/b[aá]n\s*([0-9.,]+[kKđĐ]?)/i);
      if (banMatch) sellPrice = parseTxtPriceValue(banMatch[1]);

      let loiMatch = parenContent.match(/l[ờơo][ìi]\s*([0-9.,]+[kKđĐ]?)/i);
      if (!loiMatch) loiMatch = parenContent.match(/l[ãa]i\s*([0-9.,]+[kKđĐ]?)/i);
      if (loiMatch) profit = parseTxtPriceValue(loiMatch[1]);
    }

    let name = outside;
    let buyPrice = 0;
    let quantity = 1;

    if (outside.indexOf(':') !== -1) {
      const parts = outside.split(':');
      name = parts[0].trim();
      const pricePart = parts.slice(1).join(':').trim();

      const matches = pricePart.match(/\d+[\d.,]*\s*[kKđĐ]?/g);
      if (matches) {
        matches.forEach(function(m) { buyPrice += parseTxtPriceValue(m); });
      }
    } else {
      const matches = outside.match(/\d+[\d.,]*\s*[kKđĐ]?/g);
      if (matches && matches.length > 0) {
        const lastToken = matches[matches.length - 1];
        const lastIdx = outside.lastIndexOf(lastToken);
        buyPrice = parseTxtPriceValue(lastToken);
        name = outside.substring(0, lastIdx).trim();
      }
    }

    const qtyMatch = name.match(/^(\d+)\s+(.+)$/);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10) || 1;
      name = qtyMatch[2].trim();
    }

    if (sellPrice === null && profit !== null) {
      sellPrice = buyPrice + profit;
    } else if (sellPrice !== null && profit === null) {
      profit = sellPrice - buyPrice;
    } else if (sellPrice === null && profit === null) {
      return null;
    }

    const totalBuy = buyPrice;
    const totalSell = sellPrice;
    const totalProf = profit;
    const unitBuy = quantity > 0 ? Math.round(totalBuy / quantity) : totalBuy;
    const unitSell = quantity > 0 ? Math.round(totalSell / quantity) : totalSell;
    const saleDate = defaultDate || new Date().toISOString().split('T')[0];

    return {
      name: name || 'Sản phẩm',
      quantity: quantity,
      unitBuyPrice: unitBuy,
      totalBuyPrice: totalBuy,
      unitSellPrice: unitSell,
      totalSellPrice: totalSell,
      totalProfit: totalProf,
      saleDate: saleDate,
      note: 'Nhập từ Notepad'
    };
  }

  function updateTxtPreview() {
    const text = txtPasteArea.value.trim();
    const defaultDate = txtBatchDateInput.value;

    parsedProductsFromTxt = [];
    if (!text) {
      renderTxtPreviewUI();
      return;
    }

    const lines = text.split(/\r?\n/);
    lines.forEach(function(l) {
      const p = parseTxtSingleLine(l, defaultDate);
      if (p) parsedProductsFromTxt.push(p);
    });

    renderTxtPreviewUI();
  }

  function renderTxtPreviewUI() {
    if (parsedProductsFromTxt.length === 0) {
      txtPreviewSection.classList.add('hidden');
      confirmTxtImportBtn.disabled = true;
      confirmTxtBtnText.textContent = 'Xác nhận thêm vào web (0)';
      return;
    }

    txtPreviewSection.classList.remove('hidden');
    txtParsedCount.textContent = parsedProductsFromTxt.length;

    let sumQty = 0;
    let sumCost = 0;
    let sumRevenue = 0;
    let sumProfit = 0;

    txtPreviewTableBody.innerHTML = '';

    parsedProductsFromTxt.forEach(function(item) {
      sumQty += item.quantity;
      sumCost += item.totalBuyPrice;
      sumRevenue += item.totalSellPrice;
      sumProfit += item.totalProfit;

      const tr = document.createElement('tr');
      const profitClass = item.totalProfit >= 0 ? 'table-profit-pos' : 'table-profit-neg';
      const profitPrefix = item.totalProfit > 0 ? '+' : '';

      tr.innerHTML = 
        '<td style="font-weight: 600;">' + escapeHtml(item.name) + '</td>' +
        '<td style="text-align: center; font-weight: bold; color: #475569;">x' + item.quantity + '</td>' +
        '<td style="text-align: right;">' + formatCurrency(item.totalBuyPrice) + '</td>' +
        '<td style="text-align: right;">' + formatCurrency(item.totalSellPrice) + '</td>' +
        '<td style="text-align: right;" class="' + profitClass + '">' + profitPrefix + formatCurrency(item.totalProfit) + '</td>';
      txtPreviewTableBody.appendChild(tr);
    });

    txtParsedTotalQty.textContent = sumQty;
    txtParsedTotalSummary.innerHTML = 
      '<span class="summary-chip chip-cost"><i class="fa-solid fa-cart-shopping"></i> Vốn: ' + formatCurrency(sumCost) + '</span>' +
      '<span class="summary-chip chip-revenue"><i class="fa-solid fa-tag"></i> Bán: ' + formatCurrency(sumRevenue) + '</span>' +
      '<span class="summary-chip chip-profit"><i class="fa-solid fa-sack-dollar"></i> Lời: +' + formatCurrency(sumProfit) + '</span>';

    confirmTxtImportBtn.disabled = false;
    confirmTxtBtnText.textContent = 'Xác nhận thêm vào [' + currentUser.name + '] (' + parsedProductsFromTxt.length + ' sản phẩm - ' + sumQty + ' cái)';
  }

  function handleConfirmTxtImport() {
    if (parsedProductsFromTxt.length === 0) return;

    let count = 0;
    const now = Date.now();

    parsedProductsFromTxt.forEach(function(p, idx) {
      const newProd = {
        id: 'sp-txt-' + now + '-' + idx,
        name: p.name,
        quantity: p.quantity,
        unitBuyPrice: p.unitBuyPrice,
        totalBuyPrice: p.totalBuyPrice,
        unitSellPrice: p.unitSellPrice,
        totalSellPrice: p.totalSellPrice,
        totalProfit: p.totalProfit,
        saleDate: p.saleDate,
        note: p.note,
        createdAt: now + idx
      };
      products.unshift(newProd);
      count++;
    });

    if (parsedProductsFromTxt[0] && parsedProductsFromTxt[0].saleDate) {
      selectedMonth = parsedProductsFromTxt[0].saleDate.slice(0, 7);
      selectedMonthInput.value = selectedMonth;
      showAllBtn.classList.remove('active');
    }

    saveCurrentUserData();
    closeTxtModal();
    render();

    showToast('Đã thêm thành công ' + count + ' sản phẩm cho "' + currentUser.name + '"!', 'success');
  }

  function loadSampleData() {
    const today = new Date().toISOString().split('T')[0];
    products = [
      { id: 'sp-1', name: 's75 trắng', quantity: 2, unitBuyPrice: 271800, totalBuyPrice: 543600, unitSellPrice: 400000, totalSellPrice: 800000, totalProfit: 256400, saleDate: today, note: 'bán 800k lời 256.400đ', createdAt: Date.now() - 7000 },
      { id: 'sp-2', name: 'f75', quantity: 1, unitBuyPrice: 490000, totalBuyPrice: 490000, unitSellPrice: 750000, totalSellPrice: 750000, totalProfit: 260000, saleDate: today, note: 'bán 750k lời 260k', createdAt: Date.now() - 6000 },
      { id: 'sp-3', name: 's75 đen contour', quantity: 1, unitBuyPrice: 515000, totalBuyPrice: 515000, unitSellPrice: 800000, totalSellPrice: 800000, totalProfit: 285000, saleDate: today, note: '479k + 36k keycape (lời 285k)', createdAt: Date.now() - 5000 },
      { id: 'sp-4', name: 'nova pro', quantity: 1, unitBuyPrice: 800000, totalBuyPrice: 800000, unitSellPrice: 900000, totalSellPrice: 900000, totalProfit: 100000, saleDate: today, note: 'bán 900k lời 100k', createdAt: Date.now() - 4000 },
      { id: 'sp-5', name: 'keycape', quantity: 1, unitBuyPrice: 0, totalBuyPrice: 0, unitSellPrice: 170000, totalSellPrice: 170000, totalProfit: 170000, saleDate: today, note: 'vốn 0đ lời 170k', createdAt: Date.now() - 3000 },
      { id: 'sp-6', name: 'silent', quantity: 1, unitBuyPrice: 167000, totalBuyPrice: 167000, unitSellPrice: 280000, totalSellPrice: 280000, totalProfit: 113000, saleDate: today, note: 'bán 280k lời 113k', createdAt: Date.now() - 2000 },
      { id: 'sp-7', name: 'silent', quantity: 1, unitBuyPrice: 167000, totalBuyPrice: 167000, unitSellPrice: 250000, totalSellPrice: 250000, totalProfit: 63000, saleDate: today, note: 'bán 250 lời 63k', createdAt: Date.now() - 1000 }
    ];
    saveCurrentUserData();
    showToast('Đã nạp 7 sản phẩm mẫu từ ảnh cho "' + currentUser.name + '"!', 'success');
    render();
  }

  function parsePriceNumber(val) {
    if (!val) return 0;
    const cleanStr = String(val).replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  }

  function formatNumberWithCommas(num) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US');
  }

  function formatCurrency(amount) {
    const absVal = Math.abs(amount || 0);
    return absVal.toLocaleString('vi-VN') + ' ₫';
  }

  function formatCurrencyInput(input) {
    const rawVal = parsePriceNumber(input.value);
    input.value = (rawVal === 0 && input.value.trim() === '') ? '' : formatNumberWithCommas(rawVal);
  }

  function showToast(msg, type) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toast.className = 'toast';
    if (type === 'danger') {
      toast.classList.add('toast-danger');
      toastIcon.className = 'fa-solid fa-circle-exclamation toast-icon';
    } else {
      toast.classList.add('toast-success');
      toastIcon.className = 'fa-solid fa-circle-check toast-icon';
    }
    toast.classList.remove('hidden');
    toastTimer = setTimeout(function() { toast.classList.add('hidden'); }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
