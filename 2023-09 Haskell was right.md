# Haskell was right

It's somewhat ironic that many programmers think that the (IO) monad is overly complicated and solves problems that could only ever exist in a pure lazy functional programming language; Yet, at the same time, are convinced that the following code should be considered good practice:

```c#
public interface IProcessor
{
    async Task<...> ProcessData(int id);
}

public class Processor : IProcessor
{
    private readonly IDbConnector dbConnector;

    public async Task<...> ProcessData(int id)
    {
        var data = await dbConnector.QueryAsync(id);
        return TransformData(data);
    }
}
```
... where IO is explicitly marked in three different places.
- `async` because you do not want your app to lag or your web server run out of threads. There are very few cases where `async` does not imply IO.
- `IDbConnector` because you _might_ want to mock IO away for testing. Or use a different database later on... because that always works without breaking changes.
- `IProcessor` because Dependency Injection is the best thing since sliced bread and correctly mocking a database connector is hard.

Of course, it's less general than monads and you will be changing the `IProcessor` interface every time you add or remove a method from `Processor`. This code is not and never was about composability or API stability, it's a bandaid for the underlying problems that come with IO. Academia has good reasons for handling things in a certain way and we should build on their foundations, not ignore them.
