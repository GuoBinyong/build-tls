<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [build-tls](./build-tls.md) &gt; [DtsBundleOptions](./build-tls.dtsbundleoptions.md) &gt; [inlineDeclareExternals](./build-tls.dtsbundleoptions.inlinedeclareexternals.md)

## DtsBundleOptions.inlineDeclareExternals property

启用全局模块的 `declare module` 语句的内联，包含在应该被内联的文件中（所有本地文件和来自内联库的包）

<b>Signature:</b>

```typescript
inlineDeclareExternals?: boolean | null;
```

## Remarks

全局模块指的是 `declare module 'external-module' {}`<!-- -->，并不是 `declare module './internal-module' {}`

