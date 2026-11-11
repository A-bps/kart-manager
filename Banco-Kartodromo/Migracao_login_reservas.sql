-- Migracao para bancos KartManager criados ANTES do login/reservas.
-- Rode uma vez no banco KartManager. Bancos novos (criados pelo Hibernate) nao precisam.
-- As demais colunas/tabelas (senha_hash, perfil, criado_em, altura, peso, numero, Reserva, Faturamento...)
-- sao criadas sozinhas pelo Hibernate (ddl-auto=update) na primeira subida da API.

USE KartManager;
GO

-- O cadastro do site nao pede endereco: o CEP da pessoa passa a ser opcional.
DECLARE @fk sysname = (
    SELECT fk.name
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
    WHERE fk.parent_object_id = OBJECT_ID('Pessoa') AND c.name = 'cep_numero');

IF @fk IS NOT NULL EXEC('ALTER TABLE Pessoa DROP CONSTRAINT ' + @fk);

ALTER TABLE Pessoa ALTER COLUMN cep_numero varchar(8) NULL;

ALTER TABLE Pessoa ADD CONSTRAINT FK_Pessoa_Cep FOREIGN KEY (cep_numero) REFERENCES Cep(numero);
GO
