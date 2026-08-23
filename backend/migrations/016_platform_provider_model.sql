-- Migration 016: Переход от агрегатора к площадке-провайдеру (BrudaPay)
-- - Новые роли: OWNER, MERCHANT
-- - Привязка пользователя-мерчанта к casino (личный кабинет)
-- - Страховой депозит трейдера/мерчанта (мин. 100$ для старта работы)
-- - Реквизиты, управляемые трейдером: мин/макс лимиты на операцию

-- 1) Расширяем допустимые роли пользователя
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('OWNER', 'SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST', 'MERCHANT'));

-- 2) Привязка пользователя-мерчанта к его casino-профилю
ALTER TABLE users ADD COLUMN IF NOT EXISTS casino_id UUID REFERENCES casinos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_casino_id ON users(casino_id) WHERE casino_id IS NOT NULL;

-- 3) Страховой депозит: чтобы мерчант/трейдер мог начать работу,
--    должен быть внесён страховой депозит (по умолчанию минимум 100 USD).
ALTER TABLE casinos ADD COLUMN IF NOT EXISTS insurance_deposit DECIMAL(18, 2) NOT NULL DEFAULT 0;
ALTER TABLE casinos ADD COLUMN IF NOT EXISTS insurance_required DECIMAL(18, 2) NOT NULL DEFAULT 100;
ALTER TABLE casinos ADD COLUMN IF NOT EXISTS is_active_trader BOOLEAN NOT NULL DEFAULT FALSE;

-- 3.1) Тип аккаунта: merchant (даёт трафик) либо trader (принимает трафик,
--      заводит реквизиты и обеспечивает выплаты). Реквизиты доступны только трейдеру.
ALTER TABLE casinos ADD COLUMN IF NOT EXISTS merchant_type VARCHAR(16) NOT NULL DEFAULT 'merchant';
ALTER TABLE casinos DROP CONSTRAINT IF EXISTS casinos_merchant_type_check;
ALTER TABLE casinos ADD CONSTRAINT casinos_merchant_type_check
    CHECK (merchant_type IN ('merchant', 'trader'));


-- 4) Реквизиты, которые заводит сам трейдер: лимиты на одну операцию + владелец
ALTER TABLE requisites ADD COLUMN IF NOT EXISTS min_amount DECIMAL(18, 2) NOT NULL DEFAULT 0;
ALTER TABLE requisites ADD COLUMN IF NOT EXISTS max_amount DECIMAL(18, 2) NOT NULL DEFAULT 0;
ALTER TABLE requisites ADD COLUMN IF NOT EXISTS casino_id UUID REFERENCES casinos(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_requisites_casino_id ON requisites(casino_id) WHERE casino_id IS NOT NULL;

-- Реквизиты трейдера не привязаны к внешнему провайдеру, поэтому provider_id
-- становится необязательным.
ALTER TABLE requisites ALTER COLUMN provider_id DROP NOT NULL;


-- 5) Активируем трейдеров, у которых уже достаточно страхового депозита
UPDATE casinos
SET is_active_trader = TRUE
WHERE insurance_deposit >= insurance_required;
