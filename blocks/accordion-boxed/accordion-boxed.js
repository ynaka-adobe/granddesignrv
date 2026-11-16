/*
 * Accordion Boxed Block
 * Stack of collapsible items, each with a boxed header bar.
 * Authoring: one row per item, two cells: title | body.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label) {
      row.remove();
      return;
    }
    const summary = document.createElement('summary');
    summary.className = 'accordion-boxed-item-label';
    summary.append(...label.childNodes);

    const panel = body || document.createElement('div');
    panel.className = 'accordion-boxed-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-boxed-item';
    details.append(summary, panel);
    row.replaceWith(details);
  });
}
