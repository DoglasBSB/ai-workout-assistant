import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should allow a user to log in successfully', async ({ page }) => {
    // Estado inicial: verificar se os campos estão visíveis
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();

    // Ação: preencher o formulário e submeter
    await page.getByLabel('Email').fill('teste2@gmail.com');
    await page.getByLabel('Senha').fill('Teste@123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Checkpoint: verificar se o login foi bem-sucedido
    // e o usuário foi redirecionado
    await expect(page).toHaveURL('http://localhost:5173/dashboard');
    await expect(page.getByText('Assistente de Treinos')).toBeVisible();
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // Estado inicial
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();

    // Ação
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Senha').fill('wrongpassword');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Checkpoint: verificar se a mensagem de erro é exibida
    const errorMessage = page.getByText('Credenciais inválidas. Tente novamente.');
    await expect(errorMessage).toBeVisible();

    // Verificar se a URL não mudou
    await expect(page).not.toHaveURL('/dashboard');
  });

  test('should not submit with empty required fields', async ({ page }) => {
    // Tenta submeter com campos vazios
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // O HTML5 validation deve impedir a submissão, então a URL não deve mudar
    await expect(page).not.toHaveURL('/dashboard');

    // Agora preenche apenas um campo
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).not.toHaveURL('/dashboard');
  });
  
  test('should navigate to register page when "Criar conta" is clicked', async ({ page }) => {
    // Ação
    await page.getByRole('link', { name: 'Criar conta' }).click();
    
    // Checkpoint: verificar se a URL mudou para a página de registro
    await expect(page).toHaveURL('http://localhost:5173/register');
    await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible();
  });
});
