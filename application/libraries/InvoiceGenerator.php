<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * InvoiceGenerator Library
 * Generates PDF invoices for organizations
 */
class InvoiceGenerator {

    private $CI;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        $this->CI->load->model('Invoice_model');
        $this->CI->load->model('Organization_model');
    }

    /**
     * Generate PDF invoice
     * @param int $invoice_id Invoice ID
     * @return string|false PDF file path or false on failure
     */
    public function generate_pdf($invoice_id) {
        $invoice = $this->CI->Invoice_model->get_by_id($invoice_id);
        if (!$invoice) {
            return false;
        }
        
        $organization = $this->CI->Organization_model->get_by_id($invoice['organization_id']);
        if (!$organization) {
            return false;
        }
        
        $items = $this->CI->Invoice_model->get_items($invoice_id);
        
        // Create uploads directory if it doesn't exist
        $upload_path = FCPATH . 'uploads/invoices/';
        if (!is_dir($upload_path)) {
            mkdir($upload_path, 0755, true);
        }
        
        // Generate PDF file path
        $filename = 'invoice_' . $invoice['invoice_number'] . '_' . date('YmdHis') . '.pdf';
        $filepath = $upload_path . $filename;
        
        // For now, create a simple HTML invoice that can be converted to PDF
        // In production, use TCPDF or similar library
        $html = $this->generate_html($invoice, $organization, $items);
        
        // Save HTML file (can be converted to PDF using external tool or library)
        file_put_contents($filepath, $html);
        
        // Update invoice with PDF path
        $this->CI->Invoice_model->update($invoice_id, array('pdf_path' => 'uploads/invoices/' . $filename));
        
        return 'uploads/invoices/' . $filename;
    }

    /**
     * Generate HTML invoice template
     */
    private function generate_html($invoice, $organization, $items) {
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ' . htmlspecialchars($invoice['invoice_number']) . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { margin-bottom: 30px; }
        .invoice-info { float: right; text-align: right; }
        .organization-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .total-section { margin-top: 20px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-row.final { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <div class="invoice-info">
            <p><strong>Invoice #:</strong> ' . htmlspecialchars($invoice['invoice_number']) . '</p>
            <p><strong>Date:</strong> ' . date('F d, Y', strtotime($invoice['invoice_date'])) . '</p>
            <p><strong>Due Date:</strong> ' . date('F d, Y', strtotime($invoice['due_date'])) . '</p>
        </div>
    </div>
    
    <div class="organization-info">
        <h3>Bill To:</h3>
        <p><strong>' . htmlspecialchars($organization['name']) . '</strong></p>
        <p>' . htmlspecialchars($organization['address'] ?? '') . '</p>
        <p>' . htmlspecialchars($organization['city'] ?? '') . ', ' . htmlspecialchars($organization['state'] ?? '') . '</p>
        <p>Email: ' . htmlspecialchars($organization['email']) . '</p>
        <p>Phone: ' . htmlspecialchars($organization['phone']) . '</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>';
        
        foreach ($items as $item) {
            $html .= '<tr>
                <td>' . htmlspecialchars($item['description']) . '</td>
                <td>' . number_format($item['quantity'], 2) . '</td>
                <td>' . $organization['currency'] . ' ' . number_format($item['unit_price'], 2) . '</td>
                <td>' . $organization['currency'] . ' ' . number_format($item['total'], 2) . '</td>
            </tr>';
        }
        
        $html .= '</tbody>
    </table>
    
    <div class="total-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>' . $organization['currency'] . ' ' . number_format($invoice['subtotal'], 2) . '</span>
        </div>';
        
        if ($invoice['discount'] > 0) {
            $html .= '<div class="total-row">
                <span>Discount:</span>
                <span>- ' . $organization['currency'] . ' ' . number_format($invoice['discount'], 2) . '</span>
            </div>';
        }
        
        if ($invoice['tax_amount'] > 0) {
            $html .= '<div class="total-row">
                <span>Tax (' . number_format($invoice['tax_rate'], 2) . '%):</span>
                <span>' . $organization['currency'] . ' ' . number_format($invoice['tax_amount'], 2) . '</span>
            </div>';
        }
        
        $html .= '<div class="total-row final">
            <span>Total:</span>
            <span>' . $organization['currency'] . ' ' . number_format($invoice['total_amount'], 2) . '</span>
        </div>
        <div class="total-row">
            <span>Paid:</span>
            <span>' . $organization['currency'] . ' ' . number_format($invoice['paid_amount'], 2) . '</span>
        </div>
        <div class="total-row final">
            <span>Due:</span>
            <span>' . $organization['currency'] . ' ' . number_format($invoice['due_amount'], 2) . '</span>
        </div>
    </div>
    
    <div style="margin-top: 50px; clear: both;">
        <p><strong>Payment Status:</strong> ' . strtoupper($invoice['payment_status']) . '</p>';
        
        if ($invoice['notes']) {
            $html .= '<p><strong>Notes:</strong> ' . htmlspecialchars($invoice['notes']) . '</p>';
        }
        
        if ($invoice['terms']) {
            $html .= '<p><strong>Terms:</strong> ' . htmlspecialchars($invoice['terms']) . '</p>';
        }
        
        $html .= '</div>
</body>
</html>';
        
        return $html;
    }

    /**
     * Send invoice via email
     * @param int $invoice_id Invoice ID
     * @return bool Success status
     */
    public function send_email($invoice_id) {
        $invoice = $this->CI->Invoice_model->get_by_id($invoice_id);
        if (!$invoice) {
            return false;
        }
        
        $organization = $this->CI->Organization_model->get_by_id($invoice['organization_id']);
        if (!$organization) {
            return false;
        }
        
        // Generate PDF if not exists
        if (!$invoice['pdf_path']) {
            $this->generate_pdf($invoice_id);
            $invoice = $this->CI->Invoice_model->get_by_id($invoice_id);
        }
        
        // Load email library
        $this->CI->load->library('email');
        
        $this->CI->email->from('billing@hms.com', 'HMS Billing');
        $this->CI->email->to($organization['billing_email'] ?? $organization['email']);
        $this->CI->email->subject('Invoice #' . $invoice['invoice_number']);
        $this->CI->email->message($this->get_email_template($invoice, $organization));
        
        // Attach PDF if exists
        if ($invoice['pdf_path'] && file_exists(FCPATH . $invoice['pdf_path'])) {
            $this->CI->email->attach(FCPATH . $invoice['pdf_path']);
        }
        
        if ($this->CI->email->send()) {
            // Mark invoice as sent
            $this->CI->Invoice_model->mark_as_sent($invoice_id);
            return true;
        }
        
        return false;
    }

    /**
     * Get email template for invoice
     */
    private function get_email_template($invoice, $organization) {
        return "Dear " . $organization['name'] . ",\n\n" .
               "Please find attached invoice #" . $invoice['invoice_number'] . ".\n\n" .
               "Invoice Date: " . date('F d, Y', strtotime($invoice['invoice_date'])) . "\n" .
               "Due Date: " . date('F d, Y', strtotime($invoice['due_date'])) . "\n" .
               "Total Amount: " . $organization['currency'] . " " . number_format($invoice['total_amount'], 2) . "\n" .
               "Due Amount: " . $organization['currency'] . " " . number_format($invoice['due_amount'], 2) . "\n\n" .
               "Thank you for your business!\n\n" .
               "HMS Billing Team";
    }
}

