const TodoManager = require('./TodoManager');

// 测试函数
function runTests() {
    console.log('🧪 开始测试 TodoManager 插件...\n');
    
    const todoManager = new TodoManager();
    
    // 测试1: 添加待办事项
    console.log('📝 测试1: 添加待办事项');
    const addResult1 = todoManager.addTodo({
        title: '完成项目报告',
        description: '准备季度总结报告',
        priority: 'high',
        dueDate: '2025-08-15',
        tags: '工作,重要'
    });
    console.log(addResult1.success ? '✅ 通过' : '❌ 失败');
    console.log(addResult1.message || addResult1.error);
    console.log('');
    
    // 测试2: 添加另一个待办事项
    console.log('📝 测试2: 添加第二个待办事项');
    const addResult2 = todoManager.addTodo({
        title: '学习新技术',
        priority: 'medium',
        tags: '学习'
    });
    console.log(addResult2.success ? '✅ 通过' : '❌ 失败');
    console.log(addResult2.message || addResult2.error);
    console.log('');
    
    // 测试3: 列出待办事项
    console.log('📋 测试3: 列出待办事项');
    const listResult = todoManager.listTodos();
    console.log(listResult.success ? '✅ 通过' : '❌ 失败');
    console.log(listResult.message);
    console.log('');
    
    // 测试4: 搜索待办事项
    console.log('🔍 测试4: 搜索待办事项');
    const searchResult = todoManager.searchTodos({ keyword: '项目' });
    console.log(searchResult.success ? '✅ 通过' : '❌ 失败');
    console.log(searchResult.message);
    console.log('');
    
    // 测试5: 获取统计信息
    console.log('📊 测试5: 获取统计信息');
    const statsResult = todoManager.getStats();
    console.log(statsResult.success ? '✅ 通过' : '❌ 失败');
    console.log(statsResult.message);
    console.log('');
    
    // 测试6: 完成待办事项
    if (addResult1.success && addResult1.todo) {
        console.log('✅ 测试6: 完成待办事项');
        const completeResult = todoManager.completeTodo({ id: addResult1.todo.id });
        console.log(completeResult.success ? '✅ 通过' : '❌ 失败');
        console.log(completeResult.message || completeResult.error);
        console.log('');
    }
    
    // 测试7: 再次查看列表
    console.log('📋 测试7: 查看更新后的列表');
    const listResult2 = todoManager.listTodos({ status: 'all' });
    console.log(listResult2.success ? '✅ 通过' : '❌ 失败');
    console.log(listResult2.message);
    console.log('');
    
    console.log('🎉 测试完成！');
}

// 运行测试
runTests();