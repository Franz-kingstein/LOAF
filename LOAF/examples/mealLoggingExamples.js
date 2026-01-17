/**
 * Meal Logging Examples & Test Cases
 * Demonstrates how to use the meal logging service
 */

import mealLoggingService from '../services/mealLoggingService'

/**
 * Example 1: Basic Setup and Initialization
 */
export async function exampleBasicSetup() {
  console.log('=== Example 1: Basic Setup ===')

  // Initialize the service
  const initialized = await mealLoggingService.initialize()
  if (!initialized) {
    console.error('Failed to initialize service')
    return
  }

  console.log('✅ Service initialized successfully')
  console.log(`📊 Total foods available: ${mealLoggingService.foodDatabase.foods?.length || 0}`)
}

/**
 * Example 2: Add a Single Meal
 */
export async function exampleAddSingleMeal() {
  console.log('\n=== Example 2: Add a Single Meal ===')

  await mealLoggingService.initialize()

  const result = await mealLoggingService.addMeal(
    'user_001',          // userId
    'Hot Tea',           // food name
    240,                 // quantity
    'ml',                // unit
    'breakfast',         // meal type
    'Added honey'        // notes
  )

  if (result.success) {
    console.log('✅ Meal added successfully!')
    console.log(`📍 Meal ID: ${result.meal.mealId}`)
    console.log(`📊 Calories: ${result.meal.nutrition.calories}`)
    console.log(`💪 Protein: ${result.meal.nutrition.protein.value}g`)
  } else {
    console.error('❌ Error adding meal:', result.error)
  }
}

/**
 * Example 3: Log a Complete Day of Meals
 */
export async function exampleCompleteDayMeals() {
  console.log('\n=== Example 3: Log a Complete Day ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'

  // Breakfast
  console.log('🌅 Adding breakfast...')
  await mealLoggingService.addMeal(userId, 'Idli', 2, '1 piece', 'breakfast', 'With sambar and chutney')

  // Mid-morning snack
  console.log('🥤 Adding mid-morning drink...')
  await mealLoggingService.addMeal(userId, 'Hot Tea', 1, '1 cup', 'snack')

  // Lunch
  console.log('🍚 Adding lunch...')
  await mealLoggingService.addMeal(userId, 'Brown Rice', 150, 'g', 'lunch')
  await mealLoggingService.addMeal(userId, 'Spinach Curry', 100, 'g', 'lunch')
  await mealLoggingService.addMeal(userId, 'Roti', 2, '1 piece', 'lunch')

  // Afternoon snack
  console.log('🍎 Adding afternoon snack...')
  await mealLoggingService.addMeal(userId, 'Bananas', 1, '1 medium', 'snack')

  // Dinner
  console.log('🍽️  Adding dinner...')
  await mealLoggingService.addMeal(userId, 'Chicken Biryani', 200, 'g', 'dinner')
  await mealLoggingService.addMeal(userId, 'Raita', 100, 'g', 'dinner')

  // Get today's summary
  const log = mealLoggingService.getTodayMealLog(userId)

  if (log) {
    console.log('\n📊 Daily Summary:')
    console.log(`   Total Meals: ${log.meals.length}`)
    console.log(`   Total Calories: ${log.dayDailyNutrition.totalCalories}`)
    console.log(`   Total Protein: ${log.dayDailyNutrition.totalProtein.value}g`)
    console.log(`   Total Carbs: ${log.dayDailyNutrition.totalCarbohydrates.value}g`)
    console.log(`   Total Fat: ${log.dayDailyNutrition.totalFat.value}g`)
    console.log(`   Total Fiber: ${log.dayDailyNutrition.totalFiber.value}g`)

    console.log('\n🎯 vs Daily Targets:')
    console.log(`   Calories: ${log.nutritionVsTarget.caloriePercentage}%`)
    console.log(`   Protein: ${log.nutritionVsTarget.proteinPercentage}%`)
    console.log(`   Carbs: ${log.nutritionVsTarget.carbohydratePercentage}%`)
    console.log(`   Fat: ${log.nutritionVsTarget.fatPercentage}%`)
  }
}

/**
 * Example 4: Search for Foods
 */
export async function exampleSearchFoods() {
  console.log('\n=== Example 4: Search for Foods ===')

  await mealLoggingService.initialize()

  // Search variations
  const searches = ['Idli', 'idly', 'dal', 'rice', 'milk']

  searches.forEach(query => {
    const food = mealLoggingService.findFood(query)
    if (food) {
      console.log(`\n✅ Found: ${food.name}`)
      console.log(`   ID: ${food.id}`)
      console.log(`   Category: ${food.category}`)
      console.log(`   Aliases: ${food.aliases.slice(0, 3).join(', ')}...`)
      console.log(`   Calories per 100g: ${food.nutrition.calories}`)
      console.log(`   Protein: ${food.nutrition.protein.value}g`)
    } else {
      console.log(`❌ Not found: ${query}`)
    }
  })
}

/**
 * Example 5: Unit Conversion
 */
export async function exampleUnitConversion() {
  console.log('\n=== Example 5: Unit Conversion ===')

  await mealLoggingService.initialize()

  const food = mealLoggingService.findFood('Rice')

  if (food) {
    const testUnits = [
      { quantity: 100, unit: 'g' },
      { quantity: 1, unit: '1 cup' },
      { quantity: 1, unit: '1 katori' },
      { quantity: 3.5, unit: 'oz' }
    ]

    console.log(`\nConversions for "${food.name}":`)
    testUnits.forEach(({ quantity, unit }) => {
      const grams = mealLoggingService.convertToGrams(quantity, unit, food)
      const nutrition = mealLoggingService.calculateNutrition(food, grams)
      console.log(`   ${quantity} ${unit} = ${grams}g = ${nutrition.calories} cal`)
    })
  }
}

/**
 * Example 6: Nutrition Summary for Date Range
 */
export async function exampleNutritionSummary() {
  console.log('\n=== Example 6: Nutrition Summary ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'

  // Add meals for multiple days (simulated)
  // Day 1
  console.log('Adding sample meals for analytics...')
  await mealLoggingService.addMeal(userId, 'Idli', 2, '1 piece', 'breakfast')
  await mealLoggingService.addMeal(userId, 'Rice', 150, 'g', 'lunch')
  await mealLoggingService.addMeal(userId, 'Biryani', 200, 'g', 'dinner')

  // Get summary for last 7 days
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const summary = mealLoggingService.getNutritionSummary(
    userId,
    startDate,
    endDate
  )

  console.log('\n📈 Weekly Summary:')
  console.log(`   Days logged: ${summary.totalDays}`)
  console.log(`   Total meals: ${summary.totalMeals}`)
  console.log(`   Avg daily calories: ${summary.avgCalories}`)
  console.log(`   Avg daily protein: ${summary.avgProtein}g`)
  console.log(`   Avg daily carbs: ${summary.avgCarbs}g`)
  console.log(`   Avg daily fat: ${summary.avgFat}g`)
  console.log(`   Avg daily fiber: ${summary.avgFiber}g`)

  if (summary.dayByDay.length > 0) {
    console.log('\n   Day-by-day breakdown:')
    summary.dayByDay.forEach(day => {
      console.log(`   ${day.date}: ${day.calories} cal, ${day.protein}g protein, ${day.mealCount} meals`)
    })
  }
}

/**
 * Example 7: Get Meals by Type
 */
export async function exampleMealsByType() {
  console.log('\n=== Example 7: Meals by Type ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'
  const today = new Date().toISOString().split('T')[0]

  // Add sample meals
  await mealLoggingService.addMeal(userId, 'Idli', 2, '1 piece', 'breakfast')
  await mealLoggingService.addMeal(userId, 'Tea', 1, '1 cup', 'snack')
  await mealLoggingService.addMeal(userId, 'Rice', 150, 'g', 'lunch')
  await mealLoggingService.addMeal(userId, 'Biryani', 200, 'g', 'dinner')

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  mealTypes.forEach(mealType => {
    const meals = mealLoggingService.getMealsByType(userId, today, mealType)
    console.log(`\n${mealType.toUpperCase()}:`)
    if (meals.length > 0) {
      meals.forEach(meal => {
        console.log(`   - ${meal.foodName} (${meal.quantity} ${meal.quantityUnit})`)
        console.log(`     ${meal.nutrition.calories} cal, ${meal.nutrition.protein.value}g protein`)
      })
    } else {
      console.log('   No meals logged')
    }
  })
}

/**
 * Example 8: Update and Remove Meals
 */
export async function exampleUpdateAndRemove() {
  console.log('\n=== Example 8: Update and Remove Meals ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'

  // Add a meal
  const addResult = await mealLoggingService.addMeal(userId, 'Idli', 2, '1 piece', 'breakfast')
  console.log(`✅ Added meal: ${addResult.meal.mealId}`)
  console.log(`   Original calories: ${addResult.meal.nutrition.calories}`)

  const logId = addResult.dailyLog.logId
  const mealId = addResult.meal.mealId

  // Update the meal quantity
  const updateResult = await mealLoggingService.updateMeal(
    logId,
    mealId,
    {
      quantity: 3,
      quantityUnit: '1 piece',
      notes: 'Updated to 3 pieces'
    }
  )

  if (updateResult.success) {
    console.log(`\n✅ Updated meal:`)
    console.log(`   New calories: ${updateResult.meal.nutrition.calories}`)
    console.log(`   Daily total: ${updateResult.log.dayDailyNutrition.totalCalories}`)
  }

  // Remove the meal
  const removeResult = await mealLoggingService.removeMeal(logId, mealId)
  if (removeResult.success) {
    console.log(`\n✅ Removed meal`)
    console.log(`   Daily total after removal: ${removeResult.log.dayDailyNutrition.totalCalories}`)
  }
}

/**
 * Example 9: Voice Input Simulation
 */
export async function exampleVoiceInput() {
  console.log('\n=== Example 9: Voice Input Simulation ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'

  // Simulate various voice inputs
  const voiceInputs = [
    'Two idlis with sambar',
    'One cup of hot chai',
    'Rice and dal for lunch',
    'Apple snack'
  ]

  voiceInputs.forEach(async (voiceInput) => {
    console.log(`\n🎤 Voice input: "${voiceInput}"`)

    // Extract food name (simple approach)
    const foodName = voiceInput.split(' ')[1] || voiceInput.split(' ')[0]
    const food = mealLoggingService.findFood(foodName)

    if (food) {
      console.log(`✅ Recognized: ${food.name}`)
      // In real app, would extract quantity and meal type from voice
    } else {
      console.log(`❌ Could not recognize food`)
    }
  })
}

/**
 * Example 10: Export and Backup
 */
export async function exampleExportData() {
  console.log('\n=== Example 10: Export Data ===')

  await mealLoggingService.initialize()
  const userId = 'user_001'

  // Add some meals
  await mealLoggingService.addMeal(userId, 'Idli', 2, '1 piece', 'breakfast')
  await mealLoggingService.addMeal(userId, 'Rice', 150, 'g', 'lunch')

  // Export as JSON
  const exported = mealLoggingService.exportMealLogs()
  console.log('📥 Exported meal logs (first 200 chars):')
  console.log(exported.substring(0, 200) + '...')

  // Can be saved to file or sent to server
  console.log('\n✅ Export ready for backup or server sync')
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Starting Meal Logging Examples\n')

  try {
    await exampleBasicSetup()
    await exampleAddSingleMeal()
    await exampleCompleteDayMeals()
    await exampleSearchFoods()
    await exampleUnitConversion()
    await exampleNutritionSummary()
    await exampleMealsByType()
    await exampleUpdateAndRemove()
    await exampleVoiceInput()
    await exampleExportData()

    console.log('\n\n✅ All examples completed!')
  } catch (error) {
    console.error('❌ Error running examples:', error)
  }
}

// Usage: Call any example function in your app
// Example: runAllExamples() or exampleCompleteDayMeals()
