-- backup e restore do banco KartManager
-- o .bak precisa ficar numa pasta onde o SQL Server consiga gravar
-- (pasta padrao: select serverproperty('InstanceDefaultBackupPath'))

use master
go

-- 1) backup completo
backup database KartManager
to disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
with init, checksum, stats = 25
go

-- 2) conferindo o arquivo
restore verifyonly
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
go

-- arquivos que existem dentro do backup (os nomes vao no move)
restore filelistonly
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
go

-- 3) restore em um banco novo, para nao mexer no original
restore database KartManager_Restaurado
from disk = 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\KartManager_Completo.bak'
with move 'KartManager'     to 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\KartManager_Restaurado.mdf',
     move 'KartManager_log' to 'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\KartManager_Restaurado_log.ldf',
     replace, stats = 25
go

-- 4) comparando os dois bancos
select 'Original' as Banco, count(*) as Tabelas from KartManager.sys.tables
union all
select 'Restaurado', count(*) from KartManager_Restaurado.sys.tables
go

select 'Original' as Banco, count(*) as Pessoas from KartManager.dbo.Pessoa
union all
select 'Restaurado', count(*) from KartManager_Restaurado.dbo.Pessoa
go

-- views, procedures, functions e triggers
select 'Original' as Banco,
       (select count(*) from KartManager.sys.views)                                as Views,
       (select count(*) from KartManager.sys.procedures)                           as Procedures,
       (select count(*) from KartManager.sys.objects where type in ('FN','IF','TF')) as Functions,
       (select count(*) from KartManager.sys.triggers)                             as Triggers
union all
select 'Restaurado',
       (select count(*) from KartManager_Restaurado.sys.views),
       (select count(*) from KartManager_Restaurado.sys.procedures),
       (select count(*) from KartManager_Restaurado.sys.objects where type in ('FN','IF','TF')),
       (select count(*) from KartManager_Restaurado.sys.triggers)
go

-- testando uma view no banco restaurado
select * from KartManager_Restaurado.dbo.v_Resumo_Financeiro_SpeedPark
go

