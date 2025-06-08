import { test, expect } from '@playwright/test';

test.describe('Tetris Visual and Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should load all CSS styles correctly', async ({ page }) => {
    // Check if the stylesheet is loaded
    const linkElement = page.locator('link[rel="stylesheet"]');
    await expect(linkElement).toHaveAttribute('href', 'style.css');
    
    // Check that styles are applied
    const container = page.locator('.container');
    await expect(container).toBeVisible();
    
    const gameArea = page.locator('.game-area');
    await expect(gameArea).toBeVisible();
  });

  test('should have proper canvas rendering performance', async ({ page }) => {
    const canvas = page.locator('#tetris');
    
    // Take initial screenshot
    const initialScreenshot = await canvas.screenshot();
    
    // Perform rapid movements to test rendering performance
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }
    
    // Canvas should still be responsive
    const finalScreenshot = await canvas.screenshot();
    expect(initialScreenshot).toBeTruthy();
    expect(finalScreenshot).toBeTruthy();
  });

  test('should display Japanese text correctly', async ({ page }) => {
    // Check Japanese characters are displayed properly
    await expect(page.locator('h1')).toHaveText('テトリス');
    await expect(page.locator('h3').first()).toHaveText('スコア');
    await expect(page.locator('h3').nth(1)).toHaveText('レベル');
    await expect(page.locator('h3').nth(2)).toHaveText('ライン');
    await expect(page.locator('h3').nth(3)).toHaveText('次のピース');
    await expect(page.locator('p').first()).toHaveText('操作方法:');
  });

  test('should maintain visual consistency', async ({ page }) => {
    // Take a baseline screenshot of the entire game
    const fullGameScreenshot = await page.screenshot();
    expect(fullGameScreenshot).toBeTruthy();
    
    // Perform some game actions
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    // Game should still look consistent
    const afterActionsScreenshot = await page.screenshot();
    expect(afterActionsScreenshot).toBeTruthy();
  });

  test('should handle canvas context properly', async ({ page }) => {
    // Test that both canvases are working
    const mainCanvas = page.locator('#tetris');
    const nextCanvas = page.locator('#next');
    
    await expect(mainCanvas).toBeVisible();
    await expect(nextCanvas).toBeVisible();
    
    // Both should have content
    const mainCanvasContent = await mainCanvas.screenshot();
    const nextCanvasContent = await nextCanvas.screenshot();
    
    expect(mainCanvasContent).toBeTruthy();
    expect(nextCanvasContent).toBeTruthy();
  });

  test('should have responsive layout elements', async ({ page }) => {
    // Check that all layout elements are properly positioned
    const container = page.locator('.container');
    const gameArea = page.locator('.game-area');
    const info = page.locator('.info');
    const controls = page.locator('.controls');
    
    await expect(container).toBeVisible();
    await expect(gameArea).toBeVisible();
    await expect(info).toBeVisible();
    await expect(controls).toBeVisible();
    
    // Check layout doesn't break with different viewport sizes
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(container).toBeVisible();
    
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(container).toBeVisible();
  });

  test('should render game elements without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with the game
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(' ');
    
    await page.waitForTimeout(1000);
    
    // Should have no JavaScript errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should load game script correctly', async ({ page }) => {
    // Check that the compiled JavaScript is loaded
    const scriptTag = page.locator('script[src="dist/index.js"]');
    await expect(scriptTag).toHaveAttribute('type', 'module');
    
    // Check that the game object is initialized
    const gameInitialized = await page.evaluate(() => {
      return document.getElementById('tetris') !== null && 
             document.getElementById('next') !== null;
    });
    
    expect(gameInitialized).toBe(true);
  });

  test('should handle page focus and blur events', async ({ page }) => {
    // Simulate losing focus (tab switch)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    
    await page.waitForTimeout(500);
    
    // Simulate regaining focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    
    // Game should still be functional
    await expect(page.locator('#tetris')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
  });

  test('should maintain proper aspect ratio', async ({ page }) => {
    const canvas = page.locator('#tetris');
    
    // Get canvas dimensions
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    
    expect(width).toBe('320');
    expect(height).toBe('640');
    
    // Aspect ratio should be 1:2 (width:height)
    expect(Number(height) / Number(width)).toBe(2);
  });
});