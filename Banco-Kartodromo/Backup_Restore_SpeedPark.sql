-- ##########################################################################
-- BACKUP E RESTORE DO BANCO DE DADOS KartManager (Speed Park)
-- Etapa 3 do Projeto de Extensao (bonus: Backup e Restore)
--
-- Rode no SQL Server Management Studio, bloco por bloco (selecione e F5).
-- O BACKUP guarda um instantaneo completo do banco (tabelas, dados, views,
-- procedures, functions e triggers). O RESTORE recria o banco a partir dele.
--
-- Por seguranca, o RESTORE abaixo recria o banco com OUTRO nome
-- (KartManager_Restaurado). Assim voce confere o resultado sem apagar o banco
-- original. No final ha o roteiro para restaurar por cima do original.
-- ##########################################################################

use master
go

--============================================================
-- 0) Pasta onde o SQL Server grava os backups
--
-- O servico do SQL Server precisa ter permissao de escrita na pasta.
-- A pasta padrao da instalacao sempre tem; veja qual e:
--============================================================

select serverproperty('InstanceDefaultBackupPath') as PastaPadraoDeBackup
go

--============================================================
-- 1) BACKUP COMPLETO
--
-- Troque o caminho abaixo pela pasta mostrada no passo 0
-- (ou por uma pasta sua, ex.: C:\Backups\SpeedPark\).
-- WITH INIT sobrescreve o arquivo se ele ja existir;
-- CHECKSUM detecta arquivo corrompido; STATS mostra o progresso.
--============================================================

declare @pasta   nvarchar(260) = cast(serverproperty('InstanceDefaultBackupPath') as nvarchar(260))
declare @arquivo nvarchar(400) = @pasta + N'\KartManager_Completo.bak'
declare @sql     nvarchar(1000)

set @sql = N'backup database KartManager to disk = N''' + @arquivo + N''' '
         + N'with init, checksum, stats = 25, '
         + N'name = N''KartManager - backup completo'', '
         + N'description = N''Backup completo do banco do Speed Park'''

exec (@sql)
print 'Backup gravado em: ' + @arquivo
go

--============================================================
-- 2) CONFERIR O ARQUIVO DE BACKUP (sem restaurar nada)
--============================================================

declare @arquivo nvarchar(400) = cast(serverproperty('InstanceDefaultBackupPath') as nvarchar(260)) + N'\KartManager_Completo.bak'

-- verifica se o arquivo esta integro e pode ser restaurado
restore verifyonly from disk = @arquivo with checksum

-- mostra os arquivos (dados e log) que existem dentro do backup
restore filelistonly from disk = @arquivo
go

--============================================================
-- 3) RESTORE em um banco NOVO (KartManager_Restaurado)
--
-- WITH MOVE: o backup guarda os caminhos dos arquivos do banco original;
-- aqui apontamos arquivos novos para nao sobrescrever os do original.
--============================================================

declare @pasta   nvarchar(260) = cast(serverproperty('InstanceDefaultBackupPath') as nvarchar(260))
declare @arquivo nvarchar(400) = @pasta + N'\KartManager_Completo.bak'
declare @dados   nvarchar(260) = cast(serverproperty('InstanceDefaultDataPath') as nvarchar(260))
declare @log     nvarchar(260) = cast(serverproperty('InstanceDefaultLogPath')  as nvarchar(260))

-- nomes logicos dos arquivos dentro do backup
declare @arqs table (LogicalName nvarchar(128), PhysicalName nvarchar(260), Type char(1),
                     FileGroupName nvarchar(128), Size numeric(20,0), MaxSize numeric(20,0),
                     FileId bigint, CreateLSN numeric(25,0), DropLSN numeric(25,0), UniqueId uniqueidentifier,
                     ReadOnlyLSN numeric(25,0), ReadWriteLSN numeric(25,0), BackupSizeInBytes bigint,
                     SourceBlockSize int, FileGroupId int, LogGroupGUID uniqueidentifier, DifferentialBaseLSN numeric(25,0),
                     DifferentialBaseGUID uniqueidentifier, IsReadOnly bit, IsPresent bit, TDEThumbprint varbinary(32),
                     SnapshotUrl nvarchar(360))
insert into @arqs exec ('restore filelistonly from disk = N''' + @arquivo + N'''')

declare @nomeDados nvarchar(128) = (select LogicalName from @arqs where Type = 'D')
declare @nomeLog   nvarchar(128) = (select LogicalName from @arqs where Type = 'L')

declare @sql nvarchar(2000)
set @sql = N'restore database KartManager_Restaurado from disk = N''' + @arquivo + N''' '
         + N'with move N''' + @nomeDados + N''' to N''' + @dados + N'KartManager_Restaurado.mdf'', '
         + N'     move N''' + @nomeLog   + N''' to N''' + @log   + N'KartManager_Restaurado_log.ldf'', '
         + N'     replace, recovery, stats = 25'

exec (@sql)
go

--============================================================
-- 4) CONFERIR O BANCO RESTAURADO
-- (mesmas tabelas, dados e recursos do original)
--============================================================

select 'Original'   as Banco, count(*) as Tabelas from KartManager.sys.tables
union all
select 'Restaurado' as Banco, count(*) as Tabelas from KartManager_Restaurado.sys.tables
go

select 'Original'   as Banco, (select count(*) from KartManager.dbo.Pessoa)            as Pessoas,
                              (select count(*) from KartManager.sys.objects where type in ('V','P','FN','TF','TR')) as Recursos
union all
select 'Restaurado' as Banco, (select count(*) from KartManager_Restaurado.dbo.Pessoa) as Pessoas,
                              (select count(*) from KartManager_Restaurado.sys.objects where type in ('V','P','FN','TF','TR'))
go

-- os recursos tambem funcionam no banco restaurado:
select * from KartManager_Restaurado.dbo.v_Resumo_Financeiro_SpeedPark
go

--============================================================
-- 5) LIMPEZA do banco de conferencia (opcional)
--============================================================

-- drop database KartManager_Restaurado
-- go

--============================================================
-- 6) COMO RESTAURAR POR CIMA DO BANCO ORIGINAL (desastre)
--
-- Pare a API antes (ela mantem conexoes abertas). Depois:
--
--   use master
--   alter database KartManager set single_user with rollback immediate
--   restore database KartManager from disk = N'<pasta>\KartManager_Completo.bak' with replace, recovery
--   alter database KartManager set multi_user
--
-- Depois suba a API novamente.
--============================================================
