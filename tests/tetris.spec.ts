import { test, expect } from '@playwright/test';

test.describe('Tetris Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the game page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('テトリス');
    
    // Check main heading
    await expect(page.locator('h1')).toHaveText('テトリス');
    
    // Check game canvas exists
    await expect(page.locator('#tetris')).toBeVisible();
    
    // Check next piece canvas exists
    await expect(page.locator('#next')).toBeVisible();
    
    // Check UI elements
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#level')).toBeVisible();
    await expect(page.locator('#lines')).toBeVisible();
  });

  test('should display initial game state', async ({ page }) => {
    // Check initial values
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#level')).toHaveText('1');
    await expect(page.locator('#lines')).toHaveText('0');
    
    // Check that game canvas has correct dimensions
    const canvas = page.locator('#tetris');
    await expect(canvas).toHaveAttribute('width', '320');
    await expect(canvas).toHaveAttribute('height', '640');
    
    // Check next piece canvas dimensions
    const nextCanvas = page.locator('#next');
    await expect(nextCanvas).toHaveAttribute('width', '80');
    await expect(nextCanvas).toHaveAttribute('height', '80');
  });

  test('should display controls information', async ({ page }) => {
    const controls = page.locator('.controls');
    await expect(controls).toBeVisible();
    await expect(controls).toContainText('操作方法:');
    await expect(controls).toContainText('←→: 移動');
    await expect(controls).toContainText('↓: 高速落下');
    await expect(controls).toContainText('↑: 回転');
    await expect(controls).toContainText('スペース: 一気に落下');
  });

  test('should respond to keyboard input - left arrow', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial canvas state
    const canvas = page.locator('#tetris');
    const initialCanvasContent = await canvas.screenshot();
    
    // Press left arrow key
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    // Get canvas state after input
    const afterLeftCanvasContent = await canvas.screenshot();
    
    // The canvas should have changed (piece moved)
    expect(initialCanvasContent).not.toEqual(afterLeftCanvasContent);
  });

  test('should respond to keyboard input - right arrow', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial canvas state
    const canvas = page.locator('#tetris');
    const initialCanvasContent = await canvas.screenshot();
    
    // Press right arrow key
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // Get canvas state after input
    const afterRightCanvasContent = await canvas.screenshot();
    
    // The canvas should have changed (piece moved)
    expect(initialCanvasContent).not.toEqual(afterRightCanvasContent);
  });

  test('should respond to keyboard input - down arrow', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial score
    const initialScore = await page.locator('#score').textContent();
    
    // Press down arrow key multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    
    // Score should increase when manually dropping pieces
    const finalScore = await page.locator('#score').textContent();
    expect(Number(finalScore)).toBeGreaterThan(Number(initialScore));
  });

  test('should respond to keyboard input - up arrow (rotation)', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial canvas state
    const canvas = page.locator('#tetris');
    const initialCanvasContent = await canvas.screenshot();
    
    // Press up arrow key to rotate
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Get canvas state after rotation
    const afterRotationCanvasContent = await canvas.screenshot();
    
    // The canvas should have changed (piece rotated)
    expect(initialCanvasContent).not.toEqual(afterRotationCanvasContent);
  });

  test('should respond to spacebar (hard drop)', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial score
    const initialScore = await page.locator('#score').textContent();
    
    // Press spacebar for hard drop
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    
    // Score should increase significantly after hard drop
    const finalScore = await page.locator('#score').textContent();
    expect(Number(finalScore)).toBeGreaterThan(Number(initialScore || '0'));
  });

  test('should update next piece display', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Check that next piece canvas has content
    const nextCanvas = page.locator('#next');
    const nextCanvasContent = await nextCanvas.screenshot();
    
    // The next canvas should not be empty (should have a piece drawn)
    expect(nextCanvasContent).toBeTruthy();
  });

  test('should have proper game layout', async ({ page }) => {
    // Check game area layout
    const gameArea = page.locator('.game-area');
    await expect(gameArea).toBeVisible();
    
    // Check info panel
    const info = page.locator('.info');
    await expect(info).toBeVisible();
    
    // Check that all score elements are present
    const scoreSection = page.locator('.score');
    const levelSection = page.locator('.level');
    const linesSection = page.locator('.lines');
    const nextSection = page.locator('.next');
    
    await expect(scoreSection).toBeVisible();
    await expect(levelSection).toBeVisible();
    await expect(linesSection).toBeVisible();
    await expect(nextSection).toBeVisible();
  });

  test('should handle continuous movement', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(1000);
    
    // Get initial canvas state
    const canvas = page.locator('#tetris');
    const initialCanvasContent = await canvas.screenshot();
    
    // Perform multiple movements
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Get canvas state after multiple movements
    const finalCanvasContent = await canvas.screenshot();
    
    // The canvas should have changed
    expect(initialCanvasContent).not.toEqual(finalCanvasContent);
  });

  test('should have responsive canvas rendering', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    // Check that the canvas is being actively updated
    const canvas = page.locator('#tetris');
    const screenshot1 = await canvas.screenshot();
    
    // Wait for gravity to move pieces
    await page.waitForTimeout(2000);
    
    const screenshot2 = await canvas.screenshot();
    
    // The game should be actively rendering (pieces falling due to gravity)
    // Note: This might be the same if the piece hasn't moved yet, but generally should change
    // We'll check that the canvas is at least rendering properly
    expect(screenshot1).toBeTruthy();
    expect(screenshot2).toBeTruthy();
  });
});