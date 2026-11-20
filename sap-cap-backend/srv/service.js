const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  this.before('CREATE', 'PurchaseOrders', (req) => {
    if (!req.data.createdBy) {
      req.data.createdBy = 'LinqChain AI Agent';
    }
    if (!req.data.status) {
      req.data.status = 'Approved';
    }
    if (!req.data.createdAt) {
      req.data.createdAt = new Date().toISOString();
    }
  });
});
