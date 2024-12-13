document.addEventListener("DOMContentLoaded", function() {
    const colaboradorForm = document.getElementById('colaboradorForm');
    const etapa2 = document.getElementById('etapa2');
    const form = document.getElementById('reportForm');
    const reportTableBody = document.getElementById('reportTableBody');
    const totalsList = document.getElementById('totalsList');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const exportExcelButton = document.getElementById('exportExcelButton');
    let reports = [];
    let dailyTotals = {};
    let nomeCompleto = '';
    let endereco = '';
    let bairro = '';
    let cidade = '';
    let telefone = '';
    let dataEnvio = '';
    let tipoRelatorio = '';
    let equipe = '';

    colaboradorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        nomeCompleto = document.getElementById('nomeCompleto').value.toUpperCase();
        endereco = document.getElementById('endereco').value.toUpperCase();
        bairro = document.getElementById('bairro').value.toUpperCase();
        cidade = document.getElementById('cidade').value.toUpperCase();
        telefone = document.getElementById('telefone').value;
        dataEnvio = document.getElementById('dataEnvio').value;
        tipoRelatorio = document.getElementById('tipoRelatorio').value.toUpperCase();
        equipe = document.getElementById('equipe').value.toUpperCase();
        colaboradorForm.style.display = 'none';
        etapa2.style.display = 'block';
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const dataVisita = document.getElementById('dataVisita').value.toUpperCase();
        const ida = document.getElementById('ida').value.toUpperCase();
        const destino = document.getElementById('destino').value.toUpperCase();
        const bilhetagem = document.getElementById('bilhetagem').value.toUpperCase();
        const modal = document.getElementById('modal').value.toUpperCase();
        const valor = parseFloat(document.getElementById('valor').value);

        const report = { dataVisita, ida, destino, bilhetagem, modal, valor };
        reports.push(report);
        addReportToTable(report);
        updateTotals();
        form.reset();
    });

    function addReportToTable(report) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.dataVisita}</td>
            <td>${report.ida}</td>
            <td>${report.destino}</td>
            <td>${report.bilhetagem}</td>
            <td>${report.modal}</td>
            <td>${report.valor.toFixed(2)}</td>
            <td><button type="button" onclick="removeReport(this)">REMOVER</button></td>
        `;
        reportTableBody.appendChild(row);
    }

    function updateTotals() {
        dailyTotals = {};
        reports.forEach(report => {
            if (!dailyTotals[report.dataVisita]) {
                dailyTotals[report.dataVisita] = 0;
            }
            dailyTotals[report.dataVisita] += report.valor;
        });

        totalsList.innerHTML = '';
        for (const day in dailyTotals) {
            const li = document.createElement('li');
            li.textContent = `${day.toUpperCase()}: R$ ${dailyTotals[day].toFixed(2)}`;
            totalsList.appendChild(li);
        }
    }

    exportPdfButton.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16); // Ajustar o tamanho da fonte para o título
        doc.text("RELATÓRIO DE PASSAGEM", 105, 20, null, null, "center"); // Centralizar o título

        doc.setFontSize(10); // Reduzir o tamanho da fonte para os dados da 1ª etapa
        doc.text(`NOME COMPLETO: ${nomeCompleto}`, 14, 30);
        doc.text(`ENDEREÇO: ${endereco}`, 14, 40);
        doc.text(`BAIRRO: ${bairro}`, 14, 50);
        doc.text(`CIDADE: ${cidade}`, 14, 60);
        doc.text(`TELEFONE: ${telefone}`, 14, 70);
        doc.text(`DATA DE ENVIO: ${dataEnvio}`, 14, 80);
        doc.text(`TIPO DE RELATÓRIO: ${tipoRelatorio}`, 14, 90);
        doc.text(`EQUIPE: ${equipe}`, 14, 100);

        doc.autoTable({ 
            startY: 110,
            head: [['DATA DA VISITA', 'IDA', 'DESTINO', 'BILHETAGEM', 'MODAL', 'VALOR']],
            body: reports.map(report => [report.dataVisita, report.ida, report.destino, report.bilhetagem, report.modal, report.valor.toFixed(2)])
        });

        // Adicionar totais diários
        let startY = doc.lastAutoTable.finalY + 10;
        doc.text("TOTAIS POR DIA DA SEMANA:", 14, startY);
        startY += 10;
        Object.entries(dailyTotals).forEach(([day, total]) => {
            doc.text(`${day.toUpperCase()}: R$ ${total.toFixed(2)}`, 14, startY);
            startY += 10;
        });

        // Adicionar total semanal
        const weeklyTotal = Object.values(dailyTotals).reduce((sum, value) => sum + value, 0);
        doc.text(`TOTAL SEMANAL: R$ ${weeklyTotal.toFixed(2)}`, 14, startY + 10);

        doc.save('relatorio_de_passagem.pdf');
    });

    exportExcelButton.addEventListener('click', function() {
        const wb = XLSX.utils.book_new();
        
        // Adicionar dados da 1ª etapa
        const wsDataEtapa1 = [
            ['NOME COMPLETO', nomeCompleto],
            ['ENDEREÇO', endereco],
            ['BAIRRO', bairro],
            ['CIDADE', cidade],
            ['TELEFONE', telefone],
            ['DATA DE ENVIO', dataEnvio],
            ['TIPO DE RELATÓRIO', tipoRelatorio],
            ['EQUIPE', equipe]
        ];
        const wsEtapa1 = XLSX.utils.aoa_to_sheet(wsDataEtapa1);
        XLSX.utils.book_append_sheet(wb, wsEtapa1, 'Dados Iniciais');
        
        // Adicionar dados dos relatórios
        const wsReports = XLSX.utils.json_to_sheet(reports.map(report => ({
            'DATA DA VISITA': report.dataVisita,
            'IDA': report.ida,
            'DESTINO': report.destino,
            'BILHETAGEM': report.bilhetagem,
            'MODAL': report.modal,
            'VALOR': report.valor.toFixed(2)
        })));
        XLSX.utils.book_append_sheet(wb, wsReports, 'Relatórios');
        
        XLSX.writeFile(wb, 'relatorio_de_passagem.xlsx');
    });

    window.removeReport = function(button) {
        const row = button.closest('tr');
        const index = Array.from(reportTableBody.children).indexOf(row);
        reports.splice(index, 1);
        row.remove();
        updateTotals();
    };
});
