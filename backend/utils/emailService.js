import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendOrderConfirmation(customerEmail, order) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: this.generateOrderEmailTemplate(order)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Order confirmation email sent to ${customerEmail}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    async sendOrderStatusUpdate(customerEmail, order) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Order Update - ${order.orderNumber}`,
            html: this.generateStatusUpdateTemplate(order)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Order status email sent to ${customerEmail}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    generateOrderEmailTemplate(order) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .order-details { background: white; padding: 15px; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Baloch Ice Cream & Roll Corner</h1>
                        <h2>Order Confirmation</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${order.customer.name},</p>
                        <p>Thank you for your order! Here are your order details:</p>
                        
                        <div class="order-details">
                            <h3>Order #${order.orderNumber}</h3>
                            <p><strong>Status:</strong> ${order.status}</p>
                            <p><strong>Order Type:</strong> ${order.orderType}</p>
                            <p><strong>Total Amount:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
                            
                            <h4>Items:</h4>
                            <ul>
                                ${order.items.map(item => `
                                    <li>${item.quantity}x ${item.menuItem.name} - Rs. ${item.price.toFixed(2)}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <p>We'll notify you when your order is ready for pickup/delivery.</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing Baloch Ice Cream & Roll Corner!</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateStatusUpdateTemplate(order) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4ecdc4; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .status-update { background: white; padding: 15px; border-radius: 5px; text-align: center; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Status Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${order.customer.name},</p>
                        
                        <div class="status-update">
                            <h2>Your order status has been updated to:</h2>
                            <h1 style="color: #ff6b6b;">${order.status.toUpperCase()}</h1>
                            <p><strong>Order #:</strong> ${order.orderNumber}</p>
                        </div>
                        
                        <p>We're working on your order and will keep you updated.</p>
                    </div>
                    <div class="footer">
                        <p>Baloch Ice Cream & Roll Corner</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

export default new EmailService();