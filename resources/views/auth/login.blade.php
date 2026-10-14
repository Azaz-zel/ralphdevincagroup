<x-layout :title="'Sign in | '.config('site.name')" description="Sign in to read messages sent through this site.">

    <section class="shell section">

        <div class="mx-auto w-full max-w-md">

            <div class="card glass p-8 md:p-10">


                <h1 class="heading">Sign in</h1>

                <form method="POST" action="{{ route('login.store') }}" class="mt-8">

                    @csrf

                    <div class="flex flex-col gap-6">

                        <div>
                            <label for="email" class="field-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value="{{ old('email') }}"
                                autocomplete="username"
                                required
                                autofocus
                                class="field @error('email') field-error @enderror"
                                @error('email') aria-invalid="true" aria-describedby="email-error" @enderror
                            >
                            @error('email')
                                <p id="email-error" class="error-text">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="password" class="field-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autocomplete="current-password"
                                required
                                class="field @error('password') field-error @enderror"
                                @error('password') aria-invalid="true" aria-describedby="password-error" @enderror
                            >
                            @error('password')
                                <p id="password-error" class="error-text">{{ $message }}</p>
                            @enderror
                        </div>

                        <label for="remember" class="small flex min-h-11 cursor-pointer items-center gap-3">
                            <input type="checkbox" id="remember" name="remember" value="1" class="size-4">
                            Remember me
                        </label>

                        <div>
                            <button type="submit" class="btn w-full">Sign in</button>
                        </div>

                    </div>

                </form>

            </div>

        </div>

    </section>

</x-layout>
