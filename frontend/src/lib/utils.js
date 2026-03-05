// Format currency
export function formatCurrency(amount, currency = 'INR') {
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        }).format(amount || 0);
    } catch {
        return `${currency} ${(amount || 0).toFixed(2)}`;
    }
}

// Format date
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

// Generate unique ID for items
export function generateId() {
    return Math.random().toString(36).slice(2, 11);
}

// Compute invoice totals
export function computeTotals(items = [], taxPercent = 0) {
    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.quantity || item.qty || 0) * Number(item.unitPrice || item.unitprice || 0)),
        0
    );
    const tax = (subtotal * Number(taxPercent)) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

// Status color helper
export function statusClass(status) {
    switch (status) {
        case 'paid': return 'badge-paid';
        case 'unpaid': return 'badge-unpaid';
        case 'overdue': return 'badge-overdue';
        default: return 'badge-draft';
    }
}

// Debounce
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
