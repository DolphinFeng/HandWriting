// 写一个sql，查询一张Product表里，2024年后生产的每个产品类型分别有多少数量。
// 表的字段包含：product_name（产品名称），product_type（产品类型），operator（操作员），
// created_at （入库的间），is_deleted（是否删除）


`
SELECT product_name, product_type, operator 
COUNT(*) AS total_count
From Product
WHERE YEAR(created_at) >= 2024 AND is_deleted = false
GROUP BY product_name, product_type, operator
ORDER BY total_count DESC
`