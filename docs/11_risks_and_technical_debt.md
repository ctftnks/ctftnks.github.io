# 11. Risks and Technical Debt

## 11.1 Technical Debt

- **Coupling:** Some entities might be tightly coupled to the `Game` instance, making them harder to test in isolation.
- **Input Handling:** Input logic might be scattered between `Player` and global event listeners.
- **`any` types:** While TypeScript is used, there may be legacy parts or quick implementations using `any` that reduce type safety.

## 11.2 Risks

- **Browser Compatibility:** reliance on newer browser features might exclude older devices.
- **Performance Scaling:** The current collision detection (checking against walls/objects) might define $O(N^2)$ complexity in naive implementations, potentially slowing down with many objects.
