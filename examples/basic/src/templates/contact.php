<?php
/** @var string $name */
/** @var string $email */
/** @var string $subject */
/** @var string $message */
/** @var string $submitLabel */
$name = $name ?? '';
$email = $email ?? '';
$subject = $subject ?? 'General Inquiry';
$message = $message ?? '';
$submitLabel = $submitLabel ?? 'Send Message';
$fieldStyle = 'width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; margin-bottom: 12px;';
$labelStyle = 'display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px;';
?>
<div class="contact-form" style="max-width: 480px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="margin: 0 0 16px; font-size: 20px;">Contact Us</h2>
    <form>
        <div>
            <label style="<?= $labelStyle ?>">Name</label>
            <input type="text" value="<?= htmlspecialchars($name) ?>" style="<?= $fieldStyle ?>">
        </div>
        <div>
            <label style="<?= $labelStyle ?>">Email</label>
            <input type="email" value="<?= htmlspecialchars($email) ?>" style="<?= $fieldStyle ?>">
        </div>
        <div>
            <label style="<?= $labelStyle ?>">Subject</label>
            <select style="<?= $fieldStyle ?>">
                <?php foreach (['General Inquiry', 'Support', 'Sales', 'Feedback'] as $opt): ?>
                    <option<?= $opt === $subject ? ' selected' : '' ?>><?= $opt ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div>
            <label style="<?= $labelStyle ?>">Message</label>
            <textarea rows="4" style="<?= $fieldStyle ?>"><?= htmlspecialchars($message) ?></textarea>
        </div>
        <button type="submit" style="padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;"><?= htmlspecialchars($submitLabel) ?></button>
    </form>
</div>
