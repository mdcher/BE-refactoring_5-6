-- ========================================
-- ТЕСТ ПІДКЛЮЧЕННЯ DataGrip
-- ========================================
-- Виконайте цей скрипт в DataGrip щоб перевірити підключення

-- 1. Перевірка до якої бази ви підключені
SELECT current_database() as connected_to_database;

-- 2. Перевірка поточного користувача
SELECT current_user as logged_in_as;

-- 3. Список всіх таблиць в схемі public
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Кількість записів в таблиці books
SELECT COUNT(*) as total_books FROM public.books;

-- 5. Всі книги з таблиці books
SELECT * FROM public.books ORDER BY bookid;

-- 6. Кількість записів в таблиці loans
SELECT COUNT(*) as total_loans FROM public.loans;

-- 7. Всі видачі з таблиці loans
SELECT * FROM public.loans ORDER BY loanid;

-- 8. Перевірка структури таблиці books
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'books'
ORDER BY ordinal_position;
