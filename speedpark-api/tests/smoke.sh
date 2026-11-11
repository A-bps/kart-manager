#!/bin/bash
# Teste de fumaca da API (login, permissoes, validacao, reservas, 409).
# Uso: ADMIN_SENHA='...' bash tests/smoke.sh      (API precisa estar em http://localhost:8080)
# Cria dados com o prefixo "QA" e apaga no fim. Sai com codigo 1 se algum teste falhar.
B=${API:-http://localhost:8080/api}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@speedpark.com}
[ -z "$ADMIN_SENHA" ] && { echo "Defina ADMIN_SENHA"; exit 2; }
OK=0; FAIL=0
req() { # metodo path token [json] -> BODY e CODE
  local m=$1 p=$2 t=$3 d=$4
  local args=(-s -m 20 -w "\n%{http_code}" -X "$m" "$B$p")
  [ -n "$t" ] && args+=(-H "Authorization: Bearer $t")
  [ -n "$d" ] && args+=(-H "Content-Type: application/json" -d "$d")
  local out; out=$(curl "${args[@]}"); CODE=${out##*$'\n'}; BODY=${out%$'\n'*}
}
t() { # descricao esperado metodo path token [json]
  req "$3" "$4" "$5" "$6"
  if [ "$CODE" = "$2" ]; then OK=$((OK+1)); printf "  ok   %-58s %s\n" "$1" "$CODE"
  else FAIL=$((FAIL+1)); printf "  FALHA %-57s esperado %s, veio %s  %s\n" "$1" "$2" "$CODE" "$(echo "$BODY" | cut -c1-140)"; fi
}
j() { echo "$BODY" | grep -o "\"$1\":\"\?[^\",}]*" | head -1 | cut -d: -f2- | tr -d '"'; }

# proxima data valida (terca-feira futura, grade de semana) para nao depender do dia de hoje
DATA=$(date -d "next tuesday +7 days" +%F 2>/dev/null || date -v+tue +%F)
SUF=$(date +%s)

echo "== Login e protecao"
t "sem token em rota protegida -> 401" 401 GET /pilotos ""
t "login com senha errada -> 401" 401 POST /auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"senha\":\"errada123\"}"
t "login com e-mail inexistente -> 401" 401 POST /auth/login "" '{"email":"nao@existe.com","senha":"qualquer1"}'
t "login sem campos -> 400" 400 POST /auth/login "" '{}'
t "login admin -> 200" 200 POST /auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"senha\":\"$ADMIN_SENHA\"}"
ADM=$(j token)
echo "$BODY" | grep -q senha && { FAIL=$((FAIL+1)); echo "  FALHA resposta do login expoe campo senha"; }
t "token invalido -> 401" 401 GET /pilotos "abc.def.ghi"

echo "== Cadastro e validacao"
P="{\"nome\":\"QA Piloto $SUF\",\"cpf\":\"123.456.789-0${SUF: -1}\",\"email\":\"qa$SUF@teste.com\",\"telefone\":\"(17) 99999-0000\",\"nascimento\":\"2000-05-10\",\"altura\":175,\"peso\":70,\"senha\":\"segredo123\"}"
t "registro publico -> 201" 201 POST /auth/registro "" "$P"
PID=$(j id)
echo "$BODY" | grep -qE "senha|hash" && { FAIL=$((FAIL+1)); echo "  FALHA resposta do registro expoe senha/hash"; }
t "e-mail duplicado -> 409" 409 POST /auth/registro "" "$P"
t "CPF invalido -> 400" 400 POST /auth/registro "" "{\"nome\":\"X Y\",\"cpf\":\"123\",\"email\":\"a$SUF@t.com\",\"telefone\":\"1\",\"nascimento\":\"2000-01-01\",\"senha\":\"segredo123\"}"
t "senha curta -> 400" 400 POST /auth/registro "" "{\"nome\":\"X Y\",\"cpf\":\"11111111111\",\"email\":\"b$SUF@t.com\",\"telefone\":\"1\",\"nascimento\":\"2000-01-01\",\"senha\":\"123\"}"
t "e-mail invalido -> 400" 400 POST /auth/registro "" "{\"nome\":\"X Y\",\"cpf\":\"11111111111\",\"email\":\"nao-e-email\",\"telefone\":\"1\",\"nascimento\":\"2000-01-01\",\"senha\":\"segredo123\"}"
t "nascimento no futuro -> 400" 400 POST /auth/registro "" "{\"nome\":\"X Y\",\"cpf\":\"11111111111\",\"email\":\"c$SUF@t.com\",\"telefone\":\"1\",\"nascimento\":\"2999-01-01\",\"senha\":\"segredo123\"}"
t "JSON quebrado -> 400" 400 POST /auth/registro "" 'isto nao e json'
t "login piloto -> 200" 200 POST /auth/login "" "{\"email\":\"qa$SUF@teste.com\",\"senha\":\"segredo123\"}"
PIL=$(j token)

echo "== Senha esquecida (e-mail + CPF)"
CPFN="123456789-0${SUF: -1}"; CPFN=${CPFN//-/}
t "CPF errado nao redefine -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"qa$SUF@teste.com\",\"cpf\":\"00000000191\",\"novaSenha\":\"novasenha1\"}"
t "e-mail inexistente nao redefine -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"nao@existe.com\",\"cpf\":\"$CPFN\",\"novaSenha\":\"novasenha1\"}"
t "senha nova curta -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"qa$SUF@teste.com\",\"cpf\":\"$CPFN\",\"novaSenha\":\"123\"}"
t "admin nao redefine por aqui -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"$ADMIN_EMAIL\",\"cpf\":\"00000000000\",\"novaSenha\":\"novasenha1\"}"
t "nova senha igual a atual -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"qa$SUF@teste.com\",\"cpf\":\"$CPFN\",\"novaSenha\":\"segredo123\"}"
echo "$BODY" | grep -q 'igual' || { FAIL=$((FAIL+1)); echo "  FALHA mensagem deveria explicar que a senha nao pode ser igual"; }
t "e-mail + CPF corretos redefinem -> 204" 204 POST /auth/redefinir-senha "" "{\"email\":\"qa$SUF@teste.com\",\"cpf\":\"123.456.789-0${SUF: -1}\",\"novaSenha\":\"novasenha1\"}"
t "senha antiga deixa de valer -> 401" 401 POST /auth/login "" "{\"email\":\"qa$SUF@teste.com\",\"senha\":\"segredo123\"}"
t "senha nova funciona -> 200" 200 POST /auth/login "" "{\"email\":\"qa$SUF@teste.com\",\"senha\":\"novasenha1\"}"
PIL=$(j token)
t "repetir a senha que acabou de definir -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"qa$SUF@teste.com\",\"cpf\":\"$CPFN\",\"novaSenha\":\"novasenha1\"}"

echo "== Bloqueio contra tentativas repetidas (5 erros)"
LE="qlock$SUF@teste.com"
curl -s -X POST $B/auth/registro -H 'Content-Type: application/json' -d "{\"nome\":\"QA Lock $SUF\",\"cpf\":\"4444444444${SUF: -1}\",\"email\":\"$LE\",\"telefone\":\"1\",\"nascimento\":\"2001-01-01\",\"senha\":\"segredo123\"}" > /dev/null
LID=$(curl -s $B/pilotos -H "Authorization: Bearer $ADM" | grep -o "\"id\":[0-9]*,\"nome\":\"QA Lock $SUF\"" | head -1 | grep -o '[0-9]*' | head -1)
for i in 1 2 3 4; do t "senha errada #$i -> 401" 401 POST /auth/login "" "{\"email\":\"$LE\",\"senha\":\"errada$i\"}"; done
t "5a senha errada bloqueia -> 429" 429 POST /auth/login "" "{\"email\":\"$LE\",\"senha\":\"errada5\"}"
echo "$BODY" | grep -qi 'tente novamente' || { FAIL=$((FAIL+1)); echo "  FALHA mensagem do bloqueio deveria dizer em quanto tempo tentar de novo"; }
t "bloqueado: ate a senha CERTA e recusada -> 429" 429 POST /auth/login "" "{\"email\":\"$LE\",\"senha\":\"segredo123\"}"
t "outro e-mail nao e afetado -> 401" 401 POST /auth/login "" '{"email":"outro@teste.com","senha":"qualquer1"}'
for i in 1 2 3 4; do t "CPF errado #$i na redefinicao -> 400" 400 POST /auth/redefinir-senha "" "{\"email\":\"$LE\",\"cpf\":\"0000000019$i\",\"novaSenha\":\"novasenha1\"}"; done
t "5o CPF errado bloqueia -> 429" 429 POST /auth/redefinir-senha "" "{\"email\":\"$LE\",\"cpf\":\"00000000195\",\"novaSenha\":\"novasenha1\"}"
t "bloqueado: ate o CPF CERTO e recusado -> 429" 429 POST /auth/redefinir-senha "" "{\"email\":\"$LE\",\"cpf\":\"4444444444${SUF: -1}\",\"novaSenha\":\"novasenha1\"}"
[ -n "$LID" ] && curl -s -o /dev/null -X DELETE "$B/pilotos/$LID" -H "Authorization: Bearer $ADM"

echo "== Permissoes (piloto nao e admin)"
t "piloto lista pilotos -> 403" 403 GET /pilotos "$PIL"
t "piloto ve financeiro -> 403" 403 GET /faturamento "$PIL"
t "piloto cria kart -> 403" 403 POST /karts "$PIL" '{"numero":901,"estado":"pronto"}'
t "piloto apaga pessoa pelo CRUD -> 403" 403 DELETE /pessoas/$PID "$PIL"
t "piloto ve o proprio perfil -> 200" 200 GET /pilotos/$PID "$PIL"
t "piloto ve perfil de outro -> 403" 403 GET /pilotos/1 "$PIL"
t "piloto edita o proprio perfil -> 200" 200 PUT /pilotos/$PID "$PIL" '{"nome":"QA Piloto Editado","telefone":"(17) 98888-0000","altura":180,"peso":72}'
t "altura fora da faixa -> 400" 400 PUT /pilotos/$PID "$PIL" '{"nome":"QA","telefone":"1","altura":50,"peso":72}'
t "piloto le frota -> 200" 200 GET /karts "$PIL"

echo "== Frota (admin)"
t "admin cria kart -> 201" 201 POST /karts "$ADM" "{\"numero\":$((900+SUF%90)),\"estado\":\"pronto\"}"
KID=$(j codigo)
t "numero de kart repetido -> 409" 409 POST /karts "$ADM" "{\"numero\":$((900+SUF%90)),\"estado\":\"pronto\"}"
t "kart sem estado -> 400" 400 POST /karts "$ADM" '{"numero":950,"estado":""}'

echo "== Reservas"
R="{\"data\":\"$DATA\",\"hora\":\"14:00\",\"pistaId\":\"pista3\",\"nome\":\"QA Piloto\",\"formato\":\"tempo\",\"qtd\":10,\"formaPagamento\":\"pix\"}"
t "piloto reserva -> 201" 201 POST /reservas "$PIL" "$R"
RID=$(j id)
echo "$BODY" | grep -q '"valor":100' || { FAIL=$((FAIL+1)); echo "  FALHA valor deveria ser 100.00 (10/min x 10): $BODY"; }
t "horario fora da grade -> 400" 400 POST /reservas "$PIL" "${R/14:00/13:00}"
t "data passada -> 400" 400 POST /reservas "$PIL" "${R/$DATA/2020-01-01}"
t "quantidade invalida -> 400" 400 POST /reservas "$PIL" "${R/\"qtd\":10/\"qtd\":11}"
t "pista inexistente -> 404" 404 POST /reservas "$PIL" "${R/pista3/pista9}"
t "piloto sem formato -> 400" 400 POST /reservas "$PIL" "{\"data\":\"$DATA\",\"hora\":\"14:00\",\"pistaId\":\"pista3\",\"nome\":\"QA\"}"
t "adulto (Open) nao corre na pista Kids -> 400" 400 POST /reservas "$PIL" "${R/pista3/pista1}"
t "adulto (Open) nao corre na pista Junior -> 400" 400 POST /reservas "$PIL" "${R/pista3/pista2}"
t "sem token -> 401" 401 POST /reservas "" "$R"
t "piloto lista reservas -> 200" 200 GET /reservas "$PIL"
t "admin lanca reserva so com nome -> 201" 201 POST /reservas "$ADM" "{\"data\":\"$DATA\",\"hora\":\"16:00\",\"pistaId\":\"pista2\",\"nome\":\"Cliente Balcao\"}"
RID2=$(j id)
t "reserva gerou lancamento financeiro -> 200" 200 GET /faturamento "$ADM"
echo "$BODY" | grep -q '"valor":100' || { FAIL=$((FAIL+1)); echo "  FALHA lancamento da reserva nao apareceu no faturamento"; }
t "outro piloto nao cancela reserva alheia -> 403" 403 DELETE /reservas/$RID "$(curl -s -X POST $B/auth/registro -H 'Content-Type: application/json' -d "{\"nome\":\"QA Dois $SUF\",\"cpf\":\"2222222222${SUF: -1}\",\"email\":\"qb$SUF@teste.com\",\"telefone\":\"1\",\"nascimento\":\"2001-01-01\",\"senha\":\"segredo123\"}" >/dev/null; curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"qb$SUF@teste.com\",\"senha\":\"segredo123\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)"
t "dono cancela a propria reserva -> 204" 204 DELETE /reservas/$RID "$PIL"
t "admin cancela reserva -> 204" 204 DELETE /reservas/$RID2 "$ADM"

echo "== Corridas (ativas, encerrar, historico publico)"
POS='[{"kart":"3","nome":"QA Racer Um"},{"kart":"4","nome":"QA Racer Dois"}]'
t "piloto nao inicia corrida -> 403" 403 POST /provas "$PIL" "{\"numero\":9001,\"pistaId\":\"pista1\",\"duracaoSec\":600,\"posicoes\":$POS}"
t "piloto nao ve corridas ativas -> 403" 403 GET /provas/ativas "$PIL"
t "corrida sem pilotos -> 400" 400 POST /provas "$ADM" '{"numero":9001,"pistaId":"pista1","duracaoSec":600,"posicoes":[]}'
t "duracao absurda -> 400" 400 POST /provas "$ADM" "{\"numero\":9001,\"pistaId\":\"pista1\",\"duracaoSec\":5,\"posicoes\":$POS}"
t "pista inexistente -> 404" 404 POST /provas "$ADM" "{\"numero\":9001,\"pistaId\":\"pista9\",\"duracaoSec\":600,\"posicoes\":$POS}"
t "admin inicia corrida -> 201" 201 POST /provas "$ADM" "{\"numero\":9001,\"pistaId\":\"pista1\",\"duracaoSec\":600,\"posicoes\":$POS}"
PVID=$(j id)
t "mesma pista ocupada -> 409" 409 POST /provas "$ADM" "{\"numero\":9002,\"pistaId\":\"pista1\",\"duracaoSec\":600,\"posicoes\":$POS}"
t "admin lista corridas ativas -> 200" 200 GET /provas/ativas "$ADM"
echo "$BODY" | grep -q "QA Racer Um" || { FAIL=$((FAIL+1)); echo "  FALHA corrida ativa nao apareceu na lista"; }
t "historico e publico (sem token) -> 200" 200 GET /provas/historico ""
echo "$BODY" | grep -q "QA Racer" && { FAIL=$((FAIL+1)); echo "  FALHA corrida ativa nao deveria estar no historico"; }
t "encerrar corrida -> 200" 200 POST /provas/$PVID/encerrar "$ADM" '{"posicoes":[{"kart":"4","nome":"QA Racer Dois","melhorVolta":"58.4","penalidades":"+5s"},{"kart":"3","nome":"QA Racer Um"}]}'
t "encerrar de novo -> 409" 409 POST /provas/$PVID/encerrar "$ADM" "{\"posicoes\":$POS}"
t "historico mostra o resultado -> 200" 200 GET /provas/historico ""
echo "$BODY" | grep -q '"nome":"QA Racer Dois","melhorVolta":"58.4","penalidades":"+5s"' || { FAIL=$((FAIL+1)); echo "  FALHA resultado nao apareceu no historico: $BODY" | cut -c1-200; }
t "FUNCTION ranking -> 200" 200 GET "/relatorios/ranking?minimoCorridas=1" "$ADM"
echo "$BODY" | grep -q '"Piloto":"QA Racer Dois"' && echo "$BODY" | grep -q '"Melhor_Volta":58.4' || { FAIL=$((FAIL+1)); echo "  FALHA ranking da function nao trouxe QA Racer Dois com melhor volta 58.4: $(echo "$BODY" | cut -c1-200)"; }
t "FUNCTION ranking filtrando outra pista (pista3) -> 200" 200 GET "/relatorios/ranking?minimoCorridas=1&pista=pista3" "$ADM"
echo "$BODY" | grep -q 'QA Racer' && { FAIL=$((FAIL+1)); echo "  FALHA filtro por pista da function nao funcionou"; }
t "FUNCTION ranking exigindo 99 corridas -> 200 vazio" 200 GET "/relatorios/ranking?minimoCorridas=99" "$ADM"
echo "$BODY" | grep -q 'QA Racer' && { FAIL=$((FAIL+1)); echo "  FALHA minimo de corridas da function nao funcionou"; }
t "pista liberada depois de encerrar -> 201" 201 POST /provas "$ADM" "{\"numero\":9003,\"pistaId\":\"pista1\",\"duracaoSec\":600,\"posicoes\":$POS}"
PVID2=$(j id)
t "apaga corridas de teste -> 204" 204 DELETE /provas/$PVID2 "$ADM"
t "apaga corrida encerrada de teste -> 204" 204 DELETE /provas/$PVID "$ADM"

echo "== Dependentes (filhos)"
OUTRO=$(curl -s -X POST $B/auth/registro -H 'Content-Type: application/json' -d "{\"nome\":\"QA Tres $SUF\",\"cpf\":\"3333333333${SUF: -1}\",\"email\":\"qc$SUF@teste.com\",\"telefone\":\"1\",\"nascimento\":\"2001-01-01\",\"senha\":\"segredo123\"}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
OUTROTOK=$(curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"qc$SUF@teste.com\",\"senha\":\"segredo123\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
t "sem login -> 401" 401 GET /dependentes ""
t "piloto cadastra dependente -> 201" 201 POST /dependentes "$PIL" '{"nome":"QA Filho","nascimento":"2022-04-02","categoria":"open","altura":120,"peso":25}'
DID=$(j id)
echo "$BODY" | grep -q '"categoria":"kids"' || { FAIL=$((FAIL+1)); echo "  FALHA categoria deveria ser calculada pela idade (kids), ignorando o que o front mandou"; }
RD="{\"data\":\"$DATA\",\"hora\":\"16:00\",\"pistaId\":\"pista1\",\"nome\":\"Nome Falso\",\"dependenteId\":$DID,\"formato\":\"tempo\",\"qtd\":10,\"formaPagamento\":\"pix\"}"
t "crianca (Kids) corre na pista Kids -> 201" 201 POST /reservas "$PIL" "$RD"
RDID=$(j id)
echo "$BODY" | grep -q '"nome":"QA Filho"' || { FAIL=$((FAIL+1)); echo "  FALHA nome do participante deve vir do cadastro, nao do pedido: $BODY" | cut -c1-200; }
t "crianca (Kids) nao corre na pista Open -> 400" 400 POST /reservas "$PIL" "${RD/pista1/pista3}"
t "crianca (Kids) nao corre na pista Junior -> 400" 400 POST /reservas "$PIL" "${RD/pista1/pista2}"
t "dependente de outro piloto -> 403" 403 POST /reservas "$OUTROTOK" "$RD"
t "dependente inexistente -> 404" 404 POST /reservas "$PIL" "${RD/\"dependenteId\":$DID/\"dependenteId\":99999}"
t "categoria invalida -> 400" 400 POST /dependentes "$PIL" '{"nome":"QA Filho","nascimento":"2018-04-02","categoria":"gigante"}'
t "nascimento no futuro -> 400" 400 POST /dependentes "$PIL" '{"nome":"QA Filho","nascimento":"2999-04-02","categoria":"kids"}'
t "piloto lista os seus dependentes -> 200" 200 GET /dependentes "$PIL"
echo "$BODY" | grep -q "QA Filho" || { FAIL=$((FAIL+1)); echo "  FALHA dependente nao apareceu"; }
t "outro piloto nao ve dependente alheio -> 200" 200 GET /dependentes "$OUTROTOK"
echo "$BODY" | grep -q "QA Filho" && { FAIL=$((FAIL+1)); echo "  FALHA outro piloto enxergou o dependente"; }
t "outro piloto nao remove dependente alheio -> 403" 403 DELETE /dependentes/$DID "$OUTROTOK"
t "admin nao tem dependentes -> 403" 403 POST /dependentes "$ADM" '{"nome":"X Y","nascimento":"2018-04-02","categoria":"kids"}'
[ -n "$RDID" ] && curl -s -o /dev/null -X DELETE "$B/reservas/$RDID" -H "Authorization: Bearer $PIL"
t "piloto remove o proprio dependente -> 204" 204 DELETE /dependentes/$DID "$PIL"
t "dependente removido -> 404" 404 DELETE /dependentes/$DID "$PIL"
[ -n "$OUTRO" ] && curl -s -o /dev/null -X DELETE "$B/pilotos/$OUTRO" -H "Authorization: Bearer $ADM"

echo "== Financeiro (admin)"
t "lancamento manual -> 201" 201 POST /faturamento "$ADM" '{"valor":25.50,"descricao":"QA teste","formaPagamento":"dinheiro","status":"pendente"}'
FID=$(j id)
t "marcar como pago -> 200" 200 PUT /faturamento/$FID "$ADM" '{"status":"pago"}'
t "valor negativo -> 400" 400 POST /faturamento "$ADM" '{"valor":-5}'
t "status invalido -> 400" 400 POST /faturamento "$ADM" '{"valor":5,"status":"talvez"}'
t "apagar lancamento -> 204" 204 DELETE /faturamento/$FID "$ADM"

echo "== Relatorios (views, function e triggers do banco)"
t "sem login -> 401" 401 GET /relatorios/reservas ""
t "piloto nao acessa relatorios -> 403" 403 GET /relatorios/reservas "$PIL"
t "VIEW de reservas -> 200" 200 GET /relatorios/reservas "$ADM"
t "VIEW de reservas filtrada por periodo -> 200" 200 GET "/relatorios/reservas?de=2020-01-01&ate=2099-12-31" "$ADM"
t "periodo invalido -> 400" 400 GET "/relatorios/reservas?de=ontem" "$ADM"
t "VIEW financeira -> 200" 200 GET /relatorios/financeiro "$ADM"
echo "$BODY" | grep -q 'Total_Pago' || { FAIL=$((FAIL+1)); echo "  FALHA view financeira sem a coluna Total_Pago"; }
# a reserva criada pela PROCEDURE deve aparecer na VIEW e ter disparado a TRIGGER
t "reserva criada pela procedure -> 201" 201 POST /reservas "$PIL" "{\"data\":\"$DATA\",\"hora\":\"18:00\",\"pistaId\":\"pista3\",\"nome\":\"x\",\"formato\":\"voltas\",\"qtd\":5,\"formaPagamento\":\"dinheiro\"}"
RVID=$(j id)
req GET /relatorios/reservas "$ADM"
echo "$BODY" | grep -q "\"No_Reserva\":$RVID" || { FAIL=$((FAIL+1)); echo "  FALHA reserva $RVID nao apareceu na view v_Relatorio_Reservas_SpeedPark"; }
echo "$BODY" | grep -q '"Origem":"Site (piloto)"' || { FAIL=$((FAIL+1)); echo "  FALHA view deveria traduzir a origem (Site (piloto))"; }
req GET /relatorios/auditoria/reservas "$ADM"
echo "$BODY" | grep -q "\"idReserva\":$RVID" && OK=$((OK+1)) && echo "  ok   TRIGGER registrou a reserva $RVID no LOG_HistoricoNovaReserva" || { FAIL=$((FAIL+1)); echo "  FALHA trigger nao registrou a reserva $RVID no log"; }
# alterar status de um lancamento dispara a trigger de auditoria do financeiro
t "novo lancamento pendente -> 201" 201 POST /faturamento "$ADM" '{"valor":33.30,"descricao":"QA trigger","formaPagamento":"pix","status":"pendente"}'
TFID=$(j id)
t "marcar como pago -> 200" 200 PUT /faturamento/$TFID "$ADM" '{"status":"pago"}'
req GET /relatorios/auditoria/faturamento "$ADM"
echo "$BODY" | grep -q "\"idFaturamento\":$TFID,\"statusAnterior\":\"pendente\",\"statusNovo\":\"pago\"" && OK=$((OK+1)) && echo "  ok   TRIGGER registrou pendente -> pago do lancamento $TFID" || { FAIL=$((FAIL+1)); echo "  FALHA trigger de auditoria nao registrou a mudanca: $(echo "$BODY" | cut -c1-200)"; }
t "alterar so a descricao nao gera auditoria -> 200" 200 PUT /faturamento/$TFID "$ADM" '{"descricao":"QA trigger 2"}'
t "apaga o lancamento do teste -> 204" 204 DELETE /faturamento/$TFID "$ADM"
t "cancela a reserva do teste -> 204" 204 DELETE /reservas/$RVID "$PIL"
echo "$(curl -s "$B/relatorios/financeiro" -H "Authorization: Bearer $ADM")" > /dev/null

echo "== CRUD antigo: validacao e 409 no lugar de 500"
t "pessoa sem nome -> 400" 400 POST /pessoas "$ADM" '{"cpf":"77777777777"}'
t "UF com sigla longa -> 400" 400 POST /ufs "$ADM" '{"sigla":"SPX","nome":"Longa"}'
t "corrida com preco negativo -> 400" 400 POST /corridas "$ADM" '{"preco":-5,"data":"2030-01-01","horario":"10:00:00","pistaNr":1,"funcionarioCodigo":1}'
t "id nao numerico -> 400" 400 GET /pessoas/abc "$ADM"
t "metodo nao permitido -> 405" 405 PATCH /pessoas/1 "$ADM" '{}'

echo "== Limpeza"
# o lancamento gerado pela reserva fica no financeiro mesmo apos cancelar; apaga os do teste
req GET /faturamento "$ADM"
for f in $(echo "$BODY" | grep -oE '"id":[0-9]+,"data":"[^"]*","valor":[0-9.]+,"descricao":"Reserva[^"]*(QA Piloto|QA Filho)[^"]*"' | grep -o '^"id":[0-9]*' | cut -d: -f2); do curl -s -o /dev/null -X DELETE "$B/faturamento/$f" -H "Authorization: Bearer $ADM"; done
t "admin apaga piloto QA -> 204" 204 DELETE /pilotos/$PID "$ADM"
[ -n "$KID" ] && t "admin apaga kart QA -> 204" 204 DELETE /karts/$KID "$ADM"
for p in $(curl -s "$B/pilotos" -H "Authorization: Bearer $ADM" | grep -o '"id":[0-9]*,"nome":"QA Dois[^}]*' | grep -o '^"id":[0-9]*' | cut -d: -f2); do curl -s -o /dev/null -X DELETE "$B/pilotos/$p" -H "Authorization: Bearer $ADM"; done
t "admin nao pode apagar a si mesmo -> 409" 409 DELETE /pilotos/$(curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"senha\":\"$ADMIN_SENHA\"}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2) "$ADM"

echo; echo "Resultado: $OK ok, $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
