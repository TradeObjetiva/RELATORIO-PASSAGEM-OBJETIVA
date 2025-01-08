document.addEventListener("DOMContentLoaded", function () {
    const colaboradorForm = document.getElementById('colaboradorForm');
    const etapa2 = document.getElementById('etapa2');
    const form = document.getElementById('reportForm');
    const reportTableBody = document.getElementById('reportTableBody');
    const totalsList = document.getElementById('totalsList');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const exportExcelButton = document.getElementById('exportExcelButton');
    const numeroLinhaContainer = document.getElementById('numeroLinhaContainer');
    const tipoLinhaContainer = document.getElementById('tipoLinhaContainer');
    const valorContainer = document.getElementById('valorContainer');
    const modalSelect = document.getElementById('modal');

    let reports = [];
    let dailyTotals = {};
    let colaboradorData = {};

    colaboradorForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!document.getElementById('autorizacao').checked) {
            alert('Você precisa marcar a caixa de autorização antes de salvar os dados.');
            return;
        }

        colaboradorData = {
            nomeCompleto: document.getElementById('nomeCompleto').value.toUpperCase(),
            endereco: document.getElementById('endereco').value.toUpperCase(),
            bairro: document.getElementById('bairro').value.toUpperCase(),
            cidade: document.getElementById('cidade').value.toUpperCase(),
            telefone: document.getElementById('telefone').value,
            dataEnvio: document.getElementById('dataEnvio').value,
            tipoRelatorio: document.getElementById('tipoRelatorio').value.toUpperCase(),
            equipe: document.getElementById('equipe').value.toUpperCase(),
        };

        colaboradorForm.style.display = 'none';
        etapa2.style.display = 'block';
        handleModalChange();
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const report = {
            dataVisita: document.getElementById('dataVisita').value.toUpperCase(),
            ida: document.getElementById('ida').value.toUpperCase(),
            destino: document.getElementById('destino').value.toUpperCase(),
            bilhetagem: document.getElementById('bilhetagem').value.toUpperCase(),
            modal: modalSelect.value.toUpperCase(),
            valor: parseFloat(document.getElementById('valor').value) || 0,
            numeroLinha: document.getElementById('numeroLinha').value.toUpperCase(),
            tipoLinha: document.getElementById('tipoLinha').value.toUpperCase()
        };

        if (report.modal === 'A PÉ') {
            report.valor = 0;
            report.tipoLinha = '';
        }

        reports.push(report);
        addReportToTable(report);
        updateTotals();

        form.reset();
        document.getElementById('dataVisita').value = report.dataVisita;
        handleModalChange();
    });

    function addReportToTable(report) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.dataVisita}</td>
            <td>${report.ida}</td>
            <td>${report.destino}</td>
            <td>${report.bilhetagem}</td>
            <td>${report.modal}</td>
            <td>${report.numeroLinha || '-'}</td>
            <td>${report.tipoLinha || '-'}</td>
            <td>${report.valor.toFixed(2)}</td>
            <td><button type="button" onclick="removeReport(this)">REMOVER</button></td>
        `;
        reportTableBody.appendChild(row);
    }

    function updateTotals() {
        dailyTotals = {};
        reports.forEach(report => {
            dailyTotals[report.dataVisita] = (dailyTotals[report.dataVisita] || 0) + report.valor;
        });

        totalsList.innerHTML = '';
        for (const [day, total] of Object.entries(dailyTotals)) {
            const li = document.createElement('li');
            li.textContent = `${day}: R$ ${total.toFixed(2)}`;
            totalsList.appendChild(li);
        }
    }

    function showOtherField() {
        const bilhetagem = document.getElementById("bilhetagem").value;
        const otherField = document.getElementById("otherField");
    
        if (bilhetagem === "outros") {
            otherField.style.display = "block";
        } else {
            otherField.style.display = "none";
            document.getElementById("other").value = ""; // Limpa o campo ao esconder
        }
    }

    function handleModalChange() {
        const modal = modalSelect.value.toUpperCase();
        if (modal === 'ÔNIBUS') {
            numeroLinhaContainer.classList.remove('hidden');
            tipoLinhaContainer.classList.remove('hidden');
            valorContainer.classList.remove('hidden');
        } else if (modal === 'A PÉ') {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.add('hidden');
            document.getElementById('valor').value = 0;
        } else {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.remove('hidden');
        }
    }

    modalSelect.addEventListener('change', handleModalChange);

    exportPdfButton.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("RELATÓRIO DE PASSAGEM", 105, 20, null, null, "center");

        doc.setFontSize(10);
        Object.entries(colaboradorData).forEach(([key, value], index) => {
            doc.text(`${key.toUpperCase()}: ${value}`, 14, 30 + index * 10);
        });

        doc.autoTable({
            startY: 110,
            head: [['DATA DA VISITA', 'IDA', 'DESTINO', 'BILHETAGEM', 'MODAL', 'NÚMERO DA LINHA', 'TIPO DE LINHA', 'VALOR']],
            body: reports.map(report => [
                report.dataVisita, report.ida, report.destino, report.bilhetagem, 
                report.modal, report.numeroLinha || '-', report.tipoLinha || '-', 
                report.valor.toFixed(2)
            ])
        });

        let startY = doc.lastAutoTable.finalY + 10;
        doc.text("TOTAIS POR DIA:", 14, startY);
        startY += 10;
        for (const [day, total] of Object.entries(dailyTotals)) {
            doc.text(`${day}: R$ ${total.toFixed(2)}`, 14, startY);
            startY += 10;
        }

        const weeklyTotal = Object.values(dailyTotals).reduce((sum, total) => sum + total, 0);
        doc.text(`TOTAL SEMANAL: R$ ${weeklyTotal.toFixed(2)}`, 14, startY + 10);

        doc.save('relatorio_de_passagem.pdf');
    });

    exportExcelButton.addEventListener('click', function () {
        const wb = XLSX.utils.book_new();

        const wsEtapa1 = XLSX.utils.aoa_to_sheet(
            Object.entries(colaboradorData).map(([key, value]) => [key.toUpperCase(), value])
        );
        XLSX.utils.book_append_sheet(wb, wsEtapa1, 'Dados Iniciais');

        const wsReports = XLSX.utils.json_to_sheet(reports.map(report => ({
            'DATA DA VISITA': report.dataVisita,
            'IDA': report.ida,
            'DESTINO': report.destino,
            'BILHETAGEM': report.bilhetagem,
            'MODAL': report.modal,
            'NÚMERO DA LINHA': report.numeroLinha || '-',
            'TIPO DE LINHA': report.tipoLinha || '-',
            'VALOR': report.valor.toFixed(2)
        })));
        XLSX.utils.book_append_sheet(wb, wsReports, 'Relatórios');

        XLSX.writeFile(wb, 'relatorio_de_passagem.xlsx');
    });

    window.removeReport = function (button) {
        const row = button.closest('tr');
        const index = Array.from(reportTableBody.children).indexOf(row);
        reports.splice(index, 1);
        row.remove();
        updateTotals();
    };

    document.getElementById('bilhetagem').addEventListener('change', showOtherField);
});
