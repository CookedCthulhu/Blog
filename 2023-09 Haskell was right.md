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
- `IProcessor` because correctly mocking a database connector is hard and you don't want to deal with that.

Of course, it's less composable than monads and you will be changing the `IProcessor` interface every time you add or remove a method from `Processor`. This code is not and never was about composability or API stability, it's a bandaid for the underlying problems that come with IO. Academia has good reasons for handling things in a certain way and we should build on their foundations instead. Refinement and accessibility are our strengths.
