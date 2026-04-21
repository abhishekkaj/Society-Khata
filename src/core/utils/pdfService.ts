import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Member, Society, DashboardMetrics } from '../types';

export const generateLedgerPDF = async (society: Society, members: Member[], metrics: DashboardMetrics) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica; padding: 40px; color: #2C3E50; }
          h1 { color: #1B4F72; margin-bottom: 5px; }
          .header-info { margin-bottom: 30px; border-bottom: 2px solid #1B4F72; padding-bottom: 10px; }
          .summary-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .summary-card { padding: 15px; background: #F8F9FA; border-radius: 8px; width: 30%; text-align: center; }
          .summary-value { font-size: 18px; font-weight: bold; color: #1B4F72; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #1B4F72; color: white; text-align: left; padding: 12px; }
          td { padding: 12px; border-bottom: 1px solid #EAECEE; }
          .footer { margin-top: 50px; text-align: center; color: #7F8C8D; font-size: 12px; }
          .badge-paid { color: #27AE60; font-weight: bold; }
          .badge-pending { color: #E74C3C; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-info">
          <h1>${society.name}</h1>
          <p>Maintenance Ledger Report | Created: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div>Total Collected</div>
            <div class="summary-value">₹${metrics.totalCollected.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div>Pending Dues</div>
            <div class="summary-value">₹${metrics.totalPending.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div>Completion</div>
            <div class="summary-value">${metrics.paidPercentage.toFixed(1)}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Flat No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.flat_number}</td>
                <td class="${m.is_paid ? 'badge-paid' : 'badge-pending'}">
                  ${m.is_paid ? 'PAID' : 'PENDING'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated via Society Khata 📱 | Community Finance, Simplified.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (error) {
    console.error('PDF Generation failed', error);
  }
};
