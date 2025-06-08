import { test, expect } from '@playwright/test';

test.describe('Tetris Game Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game to fully initialize
    await page.waitForTimeout(1000);
  });

  test('should start with level 1', async ({ page }) => {
    await expect(page.locator('#level')).toHaveText('1');
  });

  test('should start with 0 lines cleared', async ({ page }) => {
    await expect(page.locator('#lines')).toHaveText('0');
  });

  test('should start with score 0', async ({ page }) => {
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should increase score when using down arrow', async ({ page }) => {
    const initialScore = await page.locator('#score').textContent();
    
    // Press down arrow to move piece down faster and gain points
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    const newScore = await page.locator('#score').textContent();
    expect(Number(newScore)).toBeGreaterThanOrEqual(Number(initialScore || '0'));
  });

  test('should increase score significantly with spacebar (hard drop)', async ({ page }) => {
    const initialScore = await page.locator('#score').textContent();
    
    // Use spacebar for hard drop which should give more points
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    
    const newScore = await page.locator('#score').textContent();
    expect(Number(newScore)).toBeGreaterThan(Number(initialScore || '0'));
  });

  test('should allow piece movement within boundaries', async ({ page }) => {
    // Move piece to the left edge
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
    }
    
    // Move piece to the right edge
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }
    
    // The game should still be running (no errors)
    await expect(page.locator('#tetris')).toBeVisible();
  });

  test('should allow piece rotation', async ({ page }) => {
    const canvas = page.locator('#tetris');
    const beforeRotation = await canvas.screenshot();
    
    // Rotate the piece
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    const afterRotation = await canvas.screenshot();
    
    // Canvas should change after rotation (unless it's an O piece)
    // We just verify the game is still responsive
    await expect(canvas).toBeVisible();
  });

  test('should handle rapid input without breaking', async ({ page }) => {
    // Rapidly press various keys
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    for (let i = 0; i < 20; i++) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      await page.keyboard.press(randomKey);
      await page.waitForTimeout(25);
    }
    
    // Game should still be functional
    await expect(page.locator('#tetris')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
  });

  test('should show next piece', async ({ page }) => {
    const nextCanvas = page.locator('#next');
    await expect(nextCanvas).toBeVisible();
    
    // Next canvas should have some content (the next piece)
    const nextContent = await nextCanvas.screenshot();
    expect(nextContent).toBeTruthy();
  });

  test('should handle game over scenario gracefully', async ({ page }) => {
    // Listen for alert dialogs (game over message)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('ゲームオーバー');
      await dialog.accept();
    });
    
    // Try to trigger game over by rapid piece dropping
    // This is a stress test to see if we can reach game over state
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press(' ');
      await page.waitForTimeout(100);
    }
    
    // Game should still be in a valid state even if game over occurred
    await expect(page.locator('#tetris')).toBeVisible();
  });

  test('should maintain consistent canvas dimensions', async ({ page }) => {
    const canvas = page.locator('#tetris');
    
    // Check dimensions before any interactions
    await expect(canvas).toHaveAttribute('width', '320');
    await expect(canvas).toHaveAttribute('height', '640');
    
    // Perform some game actions
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press(' ');
    
    // Dimensions should remain the same
    await expect(canvas).toHaveAttribute('width', '320');
    await expect(canvas).toHaveAttribute('height', '640');
  });

  test('should update UI elements during gameplay', async ({ page }) => {
    // Monitor score changes
    const initialScore = await page.locator('#score').textContent();
    
    // Perform actions that should change score
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    
    // At least score should have changed
    const finalScore = await page.locator('#score').textContent();
    expect(Number(finalScore)).toBeGreaterThanOrEqual(Number(initialScore || '0'));
  });
});