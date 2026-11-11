--============================================================
-- BACKUP E RESTORE DO BANCO DE DADOS KartManager (Speed Park)
--
-- Objetivo:
-- Fazer uma cópia de segurança completa do banco (tabelas, dados,
-- views, procedures, functions e triggers) e restaurar essa cópia.
--
-- Observação:
-- o caminho do arquivo .bak deve ser uma pasta onde o serviço do
-- SQL Server tenha permissão de gravação. O caminho abaixo é a pasta
-- de backup padrão da instalação; ajuste se a sua for diferente.
-- Para descobrir a pasta padrão:
--   select serverproperty('InstanceDefaultBackupPath')
--============================================================

use master
go

--============================================================
-- 1) BACKUP COMPLETO DO BANCO
--============================================================

backup database KartManager
to disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
with init, checksum, stats = 25
go

--============================================================
-- 2) CONFERIR O ARQUIVO DE BACKUP
--============================================================

-- verifica se o arquivo está íntegro e pode ser restaurado
restore verifyonly
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
go

-- mostra os arquivos (dados e log) que existem dentro do backup
restore filelistonly
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
go

--============================================================
-- 3) RESTORE EM UM BANCO NOVO (KartManager_Restaurado)
--
-- Para conferir o resultado sem apagar o banco original, o
-- restore é feito com outro nome. O "move" aponta os arquivos
-- do banco novo (os nomes lógicos aparecem no filelistonly).
--============================================================

restore database KartManager_Restaurado
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
with move 'KartManager'     to 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\KartManager_Restaurado.mdf',
     move 'KartManager_log' to 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\KartManager_Restaurado_log.ldf',
     replace, stats = 25
go

--============================================================
-- 4) CONFERIR O BANCO RESTAURADO
--============================================================

select 'Original' as Banco, count(*) as Tabelas from KartManager.sys.tables
union all
select 'Restaurado', count(*) from KartManager_Restaurado.sys.tables
go

select 'Original' as Banco, count(*) as Pessoas from KartManager.dbo.Pessoa
union all
select 'Restaurado', count(*) from KartManager_Restaurado.dbo.Pessoa
go

-- as views, procedures, functions e triggers também foram restauradas
select * from KartManager_Restaurado.dbo.v_Resumo_Financeiro_SpeedPark
go

--============================================================
-- 5) APAGAR O BANCO DE CONFERÊNCIA (opcional)
--============================================================

-- drop database KartManager_Restaurado
-- go

--============================================================
-- 6) RESTAURAR POR CIMA DO BANCO ORIGINAL (em caso de desastre)
--
-- Pare a API antes (ela mantém conexões abertas). Depois:
--============================================================

-- alter database KartManager set single_user with rollback immediate
-- go
--
-- restore database KartManager
-- from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
-- with replace
-- go
--
-- alter database KartManager set multi_user
-- go
