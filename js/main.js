new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'Запланированные', cards: [] },
            { title: 'В работе', cards: [] },
            { title: 'Тестирование', cards: [] },
            { title: 'Выполненные', cards: [] }
        ]
    }
});