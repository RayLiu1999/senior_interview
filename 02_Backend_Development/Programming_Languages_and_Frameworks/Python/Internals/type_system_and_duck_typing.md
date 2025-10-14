# Python 類型系統：動態類型與鴨子類型

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Python`, `Internals`, `Typing`, `Duck Typing`

## 問題詳述

Python 是一個動態類型語言，這與靜態類型語言有何不同？請解釋什麼是“鴨子類型”(Duck Typing) 的概念，並舉例說明。近年來，Python 引入了類型提示 (Type Hints)，這是否意味著 Python 正在變成一個靜態類型語言？

## 核心理論與詳解

Python 的類型系統是其靈活性和易用性的核心來源之一。理解動態類型和鴨子類型的概念，以及現代類型提示的角色，對於編寫地道且可維護的 Python 代碼至關重要。

### 1. 動態類型 (Dynamic Typing) vs. 靜態類型 (Static Typing)

這兩種範式的核心區別在於**類型檢查發生的時機**。

- **靜態類型語言 (Statically Typed Languages)**:
  - 如 Java, C++, Go。
  - 變數的類型在**編譯時 (compile-time)** 就被確定並且是固定的。
  - 類型檢查在程式運行前進行。如果你試圖將一個不相容類型的值賦給一個變數，或者調用一個物件不存在的方法，編譯器會報錯。
  - **優點**: 早期錯誤檢測，代碼可讀性和可維護性高，通常性能更好。
  - **缺點**: 靈活性較差，需要編寫更多的樣板代碼。

- **動態類型語言 (Dynamically Typed Languages)**:
  - 如 Python, JavaScript, Ruby。
  - 變數本身沒有類型，它只是一個指向物件的名稱。**類型是與物件本身相關聯的**。
  - 類型檢查延遲到**執行時 (run-time)** 進行。只有當代碼實際執行到某一行時，直譯器才會檢查操作是否合法。
  - **優點**: 靈活性極高，開發速度快，代碼更簡潔。
  - **缺點**: 錯誤只能在運行時發現，需要更完備的測試覆蓋；大型專案的可維護性面臨挑戰。

**Python 範例**:
```python
my_var = 10      # my_var 指向一個 int 物件
my_var = "hello" # 現在 my_var 指向一個 str 物件，這在動態類型語言中是完全合法的

# 類型錯誤只在執行時發生
def process(item):
    print(item.upper()) # 假設 item 會有 upper 方法

process("a string") # 正常工作
# process(123)      # 執行到這裡時，會拋出 AttributeError，因為 int 物件沒有 upper 方法
```

### 2. 鴨子類型 (Duck Typing)

鴨子類型是動態類型語言中一種重要的設計哲學。它的核心思想是：**“如果一個東西走起來像鴨子，叫起來也像鴨子，那麼它就是一隻鴨子。”**

換句話說，我們**不關心一個物件的具體類型是什麼，只關心它是否具備我們需要的能力（即方法或屬性）**。

在 Python 中，當我們編寫一個函數時，我們通常不檢查傳入物件的類型是否為 `list` 或 `str`，我們只關心它是否支持我們想要的操作，比如迭代或取長度。

**鴨子類型範例**:
```python
class Duck:
    def quack(self):
        print("Quack, quack!")
    def fly(self):
        print("Flap, flap!")

class Person:
    def quack(self):
        print("I'm quacking like a duck!")
    def fly(self):
        print("I'm flapping my arms!")

def make_it_quack_and_fly(thing):
    # 我們不檢查 thing 的類型是 Duck 還是 Person
    # 我們只假設它有 quack() 和 fly() 方法
    try:
        thing.quack()
        thing.fly()
    except AttributeError:
        print("This thing cannot behave like a duck.")

duck = Duck()
person = Person()

make_it_quack_and_fly(duck)   # 正常工作
print("-" * 20)
make_it_quack_and_fly(person) # 也能正常工作，因為 Person 物件也有 quack 和 fly 方法
```
在這個例子中，`make_it_quack_and_fly` 函數並不關心傳入的是 `Duck` 還是 `Person`。只要傳入的物件能響應 `quack()` 和 `fly()` 調用，它就能正常工作。這就是鴨子類型的精髓，它極大地促進了代碼的靈活性和可擴展性。

### 3. 類型提示 (Type Hints) 的角色

從 Python 3.5 開始，PEP 484 引入了類型提示。這允許我們為變數、函數參數和返回值添加類型標註。

```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```

**重要澄清**:
1.  **Python 仍然是動態類型語言**: 類型提示**不會**讓 Python 直譯器在執行時進行類型檢查。你可以傳遞一個非 `str` 類型的值給 `greet` 函數，直譯器本身不會報錯（除非後續操作不兼容）。
2.  **類型提示的作用**:
    - **靜態分析工具**: 類型提示的主要目的是為**靜態類型檢查器**（如 `Mypy`, `Pyright`）提供資訊。這些工具可以在程式**運行前**分析你的代碼，找出潛在的類型錯誤，從而結合了靜態類型的部分優點。
    - **提升可讀性和可維護性**: 它們作為一種形式的文檔，讓其他開發者（以及你自己）更容易理解代碼的預期輸入和輸出。
    - **改善 IDE 支持**: 現代 IDE（如 VS Code, PyCharm）利用類型提示來提供更精準的自動補全、代碼導航和錯誤高亮。

**結論**: 類型提示並未改變 Python 動態類型的本質。它是一種**可選的**、**漸進式的**增強，旨在將靜態類型分析的優點引入 Python 生態系統，以應對日益複雜的大型專案開發挑戰，但同時保留了 Python 核心的靈活性和動態性。
